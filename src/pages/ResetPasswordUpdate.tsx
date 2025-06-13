// pages/ResetPasswordUpdate.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import Header from '../components/Layout/Header'
import { useNavigate } from 'react-router-dom'
import { PasswordInput } from '../components/Password'
import { useTranslation } from 'react-i18next'

export default function ResetPasswordUpdate() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 페이지 로드 시 유효한 세션인지 확인
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        setError(t('auth.resetPasswordUpdate.invalidLink'))
      }
    }
    
    checkSession()
  }, [])

  const handleUpdate = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    
    // 비밀번호 일치 여부 확인
    if (newPassword !== confirmPassword) {
      setError(t('auth.resetPasswordUpdate.passwordMismatch'))
      setLoading(false)
      return
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setError(error.message)
      } else {
        setMessage(t('auth.resetPasswordUpdate.updateSuccess'))
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      console.error('비밀번호 업데이트 오류:', err)
      setError(t('auth.resetPasswordUpdate.updateError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout mt-12 border shadow">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">{t('auth.resetPasswordUpdate.title')}</h2>
          
          <div className="space-y-4">
            <PasswordInput
              label={t('auth.resetPasswordUpdate.newPassword')}
              value={newPassword}
              setValue={setNewPassword}
              showRequirements={true}
              showStrengthMeter={true}
            />
            
            <PasswordInput
              label={t('auth.resetPasswordUpdate.confirmPassword')}
              value={confirmPassword}
              setValue={setConfirmPassword}
              showRequirements={false}
              showStrengthMeter={false}
            />
            
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-danger text-xs">{t('auth.resetPasswordUpdate.passwordMismatch')}</p>
            )}
          </div>
          
          {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
          
          <Button 
            onClick={handleUpdate} 
            className="w-full mt-6" 
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            {loading ? t('auth.resetPasswordUpdate.processing') : t('auth.resetPasswordUpdate.changePassword')}
          </Button>
        </div>
      </div>
    </div>
  )
}
