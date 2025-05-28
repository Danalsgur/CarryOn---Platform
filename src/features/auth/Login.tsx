import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { useForm } from '@/hooks/form/useForm'
import { validateEmail, validatePassword } from '@/utils/validation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { FormInput } from '@/components/forms/FormInput'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

interface LoginForm {
  email: string
  password: string
}

const initialValues: LoginForm = {
  email: '',
  password: ''
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { values, errors, handleChange, handleSubmit } = useForm<LoginForm>({
    initialValues,
    validate: {
      email: validateEmail,
      password: validatePassword
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        setError(null)
        await login(values.email, values.password)
        navigate('/')
      } catch (err) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  })

  return (
    <AuthLayout
      title="로그인"
      subtitle="CarryOn에 오신 것을 환영합니다"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="이메일"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
          autoComplete="email"
        />

        <FormInput
          label="비밀번호"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              로그인 상태 유지
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          로그인
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <SocialLoginButtons />

        <p className="text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            회원가입
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
} 