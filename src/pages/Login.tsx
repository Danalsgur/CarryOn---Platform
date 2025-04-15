import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">
          로그인
        </h2>

        <div className="space-y-4">
          <Input label="이메일" value={email} setValue={setEmail} type="email" />
          <Input label="비밀번호" value={password} setValue={setPassword} type="password" />
        </div>

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-brand hover:bg-brand-dark text-white font-semibold py-2 rounded-control transition-all duration-200"
        >
          로그인
        </button>
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
