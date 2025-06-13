import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import { validateTextInput, ValidationResult } from '../utils/contentFilter'
import { useTranslation } from 'react-i18next'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, profile, setProfile, loading } = useAuth()
  const { t } = useTranslation()

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

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setNickname(profile.nickname || '')
      setPhone(profile.phone || '')
    }
  }, [profile])
  
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
        {t('profile.loading')}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        {t('profile.edit.noLoginInfo')}
      </div>
    )
  }

  const handleSubmit = async () => {
    setError(null)

    if (!name || !nickname || !phone) {
      setError(t('profile.edit.enterAllInfo'))
      return
    }
    
    if (!nameValidation.isValid) {
      setError(nameValidation.errorMessage || t('profile.edit.invalidName'))
      return
    }
    
    if (!nicknameValidation.isValid) {
      setError(nicknameValidation.errorMessage || t('profile.edit.invalidNickname'))
      return
    }
    
    if (!phoneValidation.isValid) {
      setError(phoneValidation.errorMessage || t('profile.edit.invalidPhone'))
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        nickname,
        phone,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate')) {
        setError(t('profile.edit.duplicateNickname'))
      } else {
        setError(t('profile.edit.saveFailed', { message: error.message }))
      }
    } else {
        setProfile({
            id: user.id as string,
            name,
            nickname,
            phone,
            country_code: 'KR',
          })

      navigate('/mypage')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">{t('profile.edit.title')}</h2>

        <div className="space-y-4">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-text-primary">{t('profile.name')}</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setName(newValue);
                  // 실시간 유효성 검사
                  if (newValue) {
                    const validation = validateTextInput(newValue, MAX_NAME_LENGTH, '이름');
                    setNameValidation(validation);
                  } else {
                    setNameValidation({ isValid: true });
                  }
                }}
                placeholder={t('profile.enterRealName')}
                maxLength={MAX_NAME_LENGTH}
                className={`w-full px-4 py-2 border rounded-control shadow-control focus:outline-none focus:ring-2 transition-all duration-200 ${nameValidation.isValid ? 'border-gray-300 focus:ring-brand focus:border-transparent' : 'border-red-300 focus:ring-red-200 focus:border-red-300'}`}
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-text-muted">
                <span className="text-xs text-text-secondary">{name.length}/{MAX_NAME_LENGTH}</span>
              </div>
            </div>
            {nameValidation.errorMessage && (
              <p className="text-danger text-xs mt-1">{nameValidation.errorMessage}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-text-primary">{t('profile.nickname')}</label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setNickname(newValue);
                  // 실시간 유효성 검사
                  if (newValue) {
                    const validation = validateTextInput(newValue, MAX_NICKNAME_LENGTH, '닉네임');
                    setNicknameValidation(validation);
                  } else {
                    setNicknameValidation({ isValid: true });
                  }
                }}
                placeholder={t('profile.enterNickname')}
                maxLength={MAX_NICKNAME_LENGTH}
                className={`w-full px-4 py-2 border rounded-control shadow-control focus:outline-none focus:ring-2 transition-all duration-200 ${nicknameValidation.isValid ? 'border-gray-300 focus:ring-brand focus:border-transparent' : 'border-red-300 focus:ring-red-200 focus:border-red-300'}`}
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-text-muted">
                <span className="text-xs text-text-secondary">{nickname.length}/{MAX_NICKNAME_LENGTH}</span>
              </div>
            </div>
            {nicknameValidation.errorMessage && (
              <p className="text-danger text-xs mt-1">{nicknameValidation.errorMessage}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-text-primary">{t('profile.phone')}</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setPhone(newValue);
                  // 실시간 유효성 검사
                  if (newValue) {
                    const validation = validateTextInput(newValue, MAX_PHONE_LENGTH, '전화번호');
                    setPhoneValidation(validation);
                  } else {
                    setPhoneValidation({ isValid: true });
                  }
                }}
                placeholder={t('profile.edit.phoneHint')}
                maxLength={MAX_PHONE_LENGTH}
                className={`w-full px-4 py-2 border rounded-control shadow-control focus:outline-none focus:ring-2 transition-all duration-200 ${phoneValidation.isValid ? 'border-gray-300 focus:ring-brand focus:border-transparent' : 'border-red-300 focus:ring-red-200 focus:border-red-300'}`}
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-text-muted">
                <span className="text-xs text-text-secondary">{phone.length}/{MAX_PHONE_LENGTH}</span>
              </div>
            </div>
            {phoneValidation.errorMessage && (
              <p className="text-danger text-xs mt-1">{phoneValidation.errorMessage}</p>
            )}
          </div>
        </div>

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

        <Button onClick={handleSubmit} className="mt-6 w-full">
          {t('profile.edit.save')}
        </Button>
      </div>
    </div>
  )
}
