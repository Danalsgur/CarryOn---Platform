// pages/ResetPasswordRequest.tsx
import { useState } from 'react'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import Header from '../components/Layout/Header'
import { useTranslation } from 'react-i18next'

export default function ResetPasswordRequest() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setMessage('')
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      })
      if (error) setError(error.message)
      else setMessage(t('auth.resetPasswordRequest.linkSent', { email }))
    } catch (err) {
      console.error('비밀번호 재설정 요청 오류:', err)
      setError(t('auth.resetPasswordRequest.requestError'))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout mt-12 border shadow">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">{t('auth.resetPasswordRequest.title')}</h2>
          <Input label={t('auth.email')} value={email} setValue={setEmail} type="email" />
          {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
          <Button onClick={handleSubmit} className="w-full mt-6">
            {t('auth.resetPasswordRequest.getResetLink')}
          </Button>
        </div>
      </div>
    </div>
  )
}
