import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import Header from '../components/Layout/Header'
import { PasswordInput } from '../components/Password'
import { useTranslation } from 'react-i18next'



export default function Signup() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)



  const handleSignup = async () => {
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError(t('auth.signup.enterEmailPassword'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.signup.passwordMismatch'))
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage(t('auth.signup.verificationSent', { email }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header /> {/* ✅ 헤더 삽입 */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200 mt-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">
            {t('auth.signup.title')}
          </h2>

          <div className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              setValue={setEmail}
              placeholder="you@example.com"
            />
            <PasswordInput
              label={t('auth.password')}
              value={password}
              setValue={setPassword}
              placeholder="••••••••"
              showRequirements={true}
              showStrengthMeter={true}
            />
            <PasswordInput
              label={t('auth.signup.confirmPassword')}
              value={confirmPassword}
              setValue={setConfirmPassword}
              placeholder="••••••••"
              showRequirements={false}
              showStrengthMeter={false}
            />
          </div>

          {error && <p className="mt-4 text-danger text-sm text-center">{error}</p>}
          {message && (
            <p className="mt-4 text-green-600 text-sm text-center whitespace-pre-line">
              {message}
            </p>
          )}

          <Button onClick={handleSignup} disabled={loading} className="mt-6 w-full">
            {loading ? t('auth.signup.signingUp') : t('auth.signup.signupButton')}
          </Button>

          <p className="text-sm text-center mt-4 text-text-secondary">
            {t('auth.signup.haveAccount')}{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-brand cursor-pointer hover:underline"
            >
              {t('auth.signup.loginLink')}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
