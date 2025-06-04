import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import { validateTextInput, ValidationResult } from '../utils/contentFilter'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, setProfile, loading } = useAuth()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
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
        country_code: 'KR',
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
        country_code: 'KR',
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
          
          <Input 
            label="전화번호" 
            value={phone} 
            setValue={setPhone} 
            placeholder="'-' 없이 숫자만 입력"
            rightElement={
              phone ? <span className="text-xs text-text-secondary">{phone.length}/{MAX_PHONE_LENGTH}</span> : undefined
            }
          />
          {phoneValidation.errorMessage && (
            <p className="text-danger text-xs mt-1">{phoneValidation.errorMessage}</p>
          )}
        </div>

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

        <Button onClick={handleSubmit} className="mt-6 w-full">
          저장하고 시작하기
        </Button>
      </div>
    </div>
  )
}
