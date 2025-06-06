import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import Header from '../components/Layout/Header'
import { PasswordInput } from '../components/Password'



export default function Signup() {
  const navigate = useNavigate()
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
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
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
      setMessage(`인증 이메일이 ${email} 주소로 전송되었습니다.\n메일을 확인하고 로그인해주세요.`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header /> {/* ✅ 헤더 삽입 */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200 mt-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">
            회원가입
          </h2>

          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={email}
              setValue={setEmail}
              placeholder="you@example.com"
            />
            <PasswordInput
              label="비밀번호"
              value={password}
              setValue={setPassword}
              placeholder="••••••••"
              showRequirements={true}
              showStrengthMeter={true}
            />
            <PasswordInput
              label="비밀번호 확인"
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
            {loading ? '가입 중...' : '가입하기'}
          </Button>

          <p className="text-sm text-center mt-4 text-text-secondary">
            이미 계정이 있나요?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-brand cursor-pointer hover:underline"
            >
              로그인
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
