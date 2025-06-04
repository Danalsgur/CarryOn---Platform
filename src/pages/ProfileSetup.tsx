import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import { validateTextInput, ValidationResult } from '../utils/contentFilter'
import { CountryCode, countryCodes, DEFAULT_COUNTRY_CODE, getCountryByCode } from '../utils/countryCodeData'

// 국가 코드 선택 드롭다운 컴포넌트
function CountryCodeDropdown({
  selectedCountry,
  onSelect,
}: {
  selectedCountry: CountryCode;
  onSelect: (country: CountryCode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-control shadow-control bg-white text-sm h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span>{selectedCountry.dialCode}</span>
          <span className="ml-2 text-gray-600 truncate">{selectedCountry.name}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ml-2 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                selectedCountry.code === country.code ? 'bg-gray-50' : ''
              }`}
              onClick={() => {
                onSelect(country);
                setIsOpen(false);
              }}
            >
              <span className="w-10 inline-block">{country.dialCode}</span>
              <span className="text-gray-600">{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, setProfile, loading } = useAuth()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState<CountryCode>(
    getCountryByCode(DEFAULT_COUNTRY_CODE) || countryCodes[0]
  )
  const [error, setError] = useState<string | null>(null)
  
  // 입력 필드별 유효성 검사 결과
  const [nameValidation, setNameValidation] = useState<ValidationResult>({ isValid: true })
  const [nicknameValidation, setNicknameValidation] = useState<ValidationResult>({ isValid: true })
  const [phoneValidation, setPhoneValidation] = useState<ValidationResult>({ isValid: true })
  
  // 입력 필드 최대 길이 제한
  const MAX_NAME_LENGTH = 20
  const MAX_NICKNAME_LENGTH = 15
  const MAX_PHONE_LENGTH = 15


  // 이름 입력 유효성 검사
  useEffect(() => {
    if (name) {
      const validation = validateTextInput(name, MAX_NAME_LENGTH, '이름');
      setNameValidation(validation);
    } else {
      setNameValidation({ isValid: true });
    }
  }, [name]);
  
  // 닉네임 입력 유효성 검사
  useEffect(() => {
    if (nickname) {
      const validation = validateTextInput(nickname, MAX_NICKNAME_LENGTH, '닉네임');
      setNicknameValidation(validation);
    } else {
      setNicknameValidation({ isValid: true });
    }
  }, [nickname]);
  
  // 전화번호 입력 유효성 검사
  useEffect(() => {
    if (phone) {
      const validation = validateTextInput(phone, MAX_PHONE_LENGTH, '전화번호');
      setPhoneValidation(validation);
    } else {
      setPhoneValidation({ isValid: true });
    }
  }, [phone]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        로딩 중입니다...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        로그인 정보가 없습니다.
      </div>
    )
  }

  const handleSubmit = async () => {
    setError(null)

    if (!name || !nickname || !phone) {
      setError('모든 정보를 입력해주세요.')
      return
    }
    
    // 모든 입력 필드의 유효성 검사
    if (!nameValidation.isValid) {
      setError(nameValidation.errorMessage || '이름이 유효하지 않습니다.')
      return
    }
    
    if (!nicknameValidation.isValid) {
      setError(nicknameValidation.errorMessage || '닉네임이 유효하지 않습니다.')
      return
    }
    
    if (!phoneValidation.isValid) {
      setError(phoneValidation.errorMessage || '전화번호가 유효하지 않습니다.')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        nickname,
        phone,
        country_code: countryCode.code,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate')) {
        setError('이미 사용 중인 닉네임입니다.')
      } else {
        setError(`프로필 저장 실패: ${error.message}`)
      }
    } else {
      const updatedProfile = {
        id: user.id,
        name,
        nickname,
        phone,
        country_code: countryCode.code,
      }

      setProfile(updatedProfile)

      setTimeout(() => {
        navigate('/mypage')
      }, 0)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">
          추가 정보 입력
        </h2>

        <div className="space-y-4">
          <Input 
            label="이름" 
            value={name} 
            setValue={setName} 
            placeholder="실명을 입력해주세요"
            rightElement={
              name ? <span className="text-xs text-text-secondary">{name.length}/{MAX_NAME_LENGTH}</span> : undefined
            }
          />
          {nameValidation.errorMessage && (
            <p className="text-danger text-xs mt-1">{nameValidation.errorMessage}</p>
          )}
          
          <Input 
            label="닉네임" 
            value={nickname} 
            setValue={setNickname} 
            placeholder="서비스에서 사용할 닉네임"
            rightElement={
              nickname ? <span className="text-xs text-text-secondary">{nickname.length}/{MAX_NICKNAME_LENGTH}</span> : undefined
            }
          />
          {nicknameValidation.errorMessage && (
            <p className="text-danger text-xs mt-1">{nicknameValidation.errorMessage}</p>
          )}
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-text-primary">전화번호</label>
            <div className="flex items-center space-x-2">
              <div className="w-1/3">
                <CountryCodeDropdown
                  selectedCountry={countryCode}
                  onSelect={setCountryCode}
                />
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="'-' 없이 숫자만 입력"
                    className="w-full px-4 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                  />
                  {phone && (
                    <div className="absolute inset-y-0 right-4 flex items-center text-text-muted">
                      <span className="text-xs text-text-secondary">{phone.length}/{MAX_PHONE_LENGTH}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {phoneValidation.errorMessage && (
              <p className="text-danger text-xs mt-1">{phoneValidation.errorMessage}</p>
            )}
          </div>

        </div>

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

        <Button onClick={handleSubmit} className="mt-6 w-full">
          저장하고 시작하기
        </Button>
      </div>
    </div>
  )
}
