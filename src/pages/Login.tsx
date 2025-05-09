import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import GoogleIcon from '../components/GoogleIcon'
import Header from '../components/Layout/Header' // ✅ 헤더 추가

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      console.log('✅ Logged in user:', data.user)
      navigate('/mypage')
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(`Google 로그인 실패: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header /> {/* ✅ 헤더 삽입 */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">로그인</h2>

          <div className="space-y-4">
            <Input label="이메일" value={email} setValue={setEmail} type="email" />
            <Input label="비밀번호" value={password} setValue={setPassword} type="password" />
          </div>

          {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full mt-6 bg-brand hover:bg-brand-dark text-white font-semibold py-2 rounded-control transition-all duration-200"
          >
            이메일로 로그인
          </button>

          <div className="my-4 text-center text-sm text-text-secondary">또는</div>

          <div className="flex justify-center">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition"
              aria-label="Sign in with Google"
            >
              <GoogleIcon />
            </button>
          </div>

          <div className="mt-6 text-sm text-center text-text-secondary">
            계정이 없으신가요?{' '}
            <span
              onClick={() => navigate('/signup')}
              className="text-brand hover:underline cursor-pointer font-medium"
            >
              회원가입
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  setValue,
  type = 'text',
}: {
  label: string
  value: string
  setValue: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
      />
    </div>
  )
}
