import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import { Pencil, AlertCircle } from 'lucide-react'
import { findInappropriateContent, ValidationResult } from '../utils/contentFilter'
import { useTranslation } from 'react-i18next'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 입력 필드별 유효성 검사 결과
  const [nameValidation, setNameValidation] = useState<ValidationResult>({ isValid: true })
  const [nicknameValidation, setNicknameValidation] = useState<ValidationResult>({ isValid: true })
  
  // 입력 필드 최대 길이 제한
  const MAX_NAME_LENGTH = 12
  const MAX_NICKNAME_LENGTH = 10
  
  // 이름 입력가 변경될 때마다 유효성 검사 수행
  useEffect(() => {
    if (!name) {
      setNameValidation({ isValid: true });
      return;
    }
    
    // 부적절한 표현 검사
    const badWords = findInappropriateContent(name);
    if (badWords.length > 0) {
      setNameValidation({
        isValid: false,
        errorMessage: t('validation.inappropriateContent', { field: t('profile.name'), words: badWords.join(', ') })
      });
      return;
    }
    
    // 길이 제한 검사
    if (name.length > MAX_NAME_LENGTH) {
      setNameValidation({
        isValid: false,
        errorMessage: t('validation.maxLength', { field: t('profile.name'), length: MAX_NAME_LENGTH })
      });
      return;
    }
    
    // 유효한 경우
    setNameValidation({ isValid: true });
  }, [name]);
  
  // 닉네임 입력가 변경될 때마다 유효성 검사 수행
  useEffect(() => {
    if (!nickname) {
      setNicknameValidation({ isValid: true });
      return;
    }
    
    // 부적절한 표현 검사
    const badWords = findInappropriateContent(nickname);
    if (badWords.length > 0) {
      setNicknameValidation({
        isValid: false,
        errorMessage: t('validation.inappropriateContent', { field: t('profile.nickname'), words: badWords.join(', ') })
      });
      return;
    }
    
    // 길이 제한 검사
    if (nickname.length > MAX_NICKNAME_LENGTH) {
      setNicknameValidation({
        isValid: false,
        errorMessage: t('validation.maxLength', { field: t('profile.nickname'), length: MAX_NICKNAME_LENGTH })
      });
      return;
    }
    
    // 유효한 경우
    setNicknameValidation({ isValid: true });
  }, [nickname]);

  // 프로필 업데이트 함수
  const handleUpdateProfile = async () => {
    if (!user) return
    
    setError(null)
    
    // 유효성 검사
    if (!name || !nickname) {
      setError(t('validation.requiredFields'))
      return
    }
    
    if (!nameValidation.isValid) {
      setError(nameValidation.errorMessage || t('validation.invalidField', { field: t('profile.name') }))
      return
    }
    
    if (!nicknameValidation.isValid) {
      setError(nicknameValidation.errorMessage || t('validation.invalidField', { field: t('profile.nickname') }))
      return
    }
    
    setUpdateLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        nickname
      })
      .eq('id', user.id)
    
    setUpdateLoading(false)
    
    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate')) {
        setError(t('errors.duplicateNickname'))
      } else {
        setError(t('errors.profileUpdateFailed', { message: error.message }))
      }
    } else {
      setIsEditing(false)
      // 페이지 새로고침하여 AuthContext에서 프로필 정보 다시 가져오기
      window.location.reload()
    }
  }

  // 세션 or 프로필 로딩 중
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        {t('profile.loading')}
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('profile.title')}</h1>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          {t('auth.loginRequired')}
        </div>
        <Button onClick={() => navigate('/login')}>{t('auth.login')}</Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('profile.memberInfo')}</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/mypage')}
        >
          {t('profile.backToMypage')}
        </Button>
      </div>

      <div className="relative border rounded-lg p-5 bg-white shadow-sm">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.email')}</label>
              <input 
                type="text" 
                value={user.email} 
                disabled 
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('profile.emailCannotBeChanged')}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.name')}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setName(newValue);
                  }}
                  placeholder={t('profile.enterRealName')}
                  maxLength={MAX_NAME_LENGTH}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${nameValidation.isValid ? 'border-gray-300 focus:ring-blue-500' : 'border-red-300 focus:ring-red-200 focus:border-red-300'}`}
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-text-muted">
                  <span className="text-xs text-text-secondary">{name.length}/{MAX_NAME_LENGTH}</span>
                </div>
              </div>
              {nameValidation.errorMessage && (
                <div className="flex items-center mt-1 text-danger text-xs">
                  <AlertCircle size={12} className="mr-1" />
                  {nameValidation.errorMessage}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.nickname')}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setNickname(newValue);
                  }}
                  placeholder={t('profile.enterNickname')}
                  maxLength={MAX_NICKNAME_LENGTH}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${nicknameValidation.isValid ? 'border-gray-300 focus:ring-blue-500' : 'border-red-300 focus:ring-red-200 focus:border-red-300'}`}
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-text-muted">
                  <span className="text-xs text-text-secondary">{nickname.length}/{MAX_NICKNAME_LENGTH}</span>
                </div>
              </div>
              {nicknameValidation.errorMessage && (
                <div className="flex items-center mt-1 text-danger text-xs">
                  <AlertCircle size={12} className="mr-1" />
                  {nicknameValidation.errorMessage}
                </div>
              )}
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start mt-4">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleUpdateProfile}
                loading={updateLoading}
              >
                {t('common.save')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  setName(profile?.name || '')
                  setNickname(profile?.nickname || '')
                  setError(null)
                  setNameValidation({ isValid: true })
                  setNicknameValidation({ isValid: true })
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Pencil size={16} className="text-gray-500" />
            </button>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">{t('profile.email')}</div>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">{t('profile.name')}</div>
                <div className="font-medium">{profile?.name || t('profile.noName')}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">{t('profile.nickname')}</div>
                <div className="font-medium">{profile?.nickname || t('profile.noNickname')}</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="border-t pt-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">{t('profile.accountManagement')}</h2>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => navigate('/reset-password')}
          >
            {t('profile.changePassword')}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={async () => {
              const { error } = await supabase.auth.signOut()
              if (!error) navigate('/')
            }}
          >
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}
