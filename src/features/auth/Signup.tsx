import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { useForm } from '@/hooks/form/useForm'
import { validateEmail, validatePassword, validateNickname, validatePhoneNumber } from '@/utils/validation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { FormInput } from '@/components/forms/FormInput'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  nickname: string
  phoneNumber: string
}

const initialValues: SignupForm = {
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phoneNumber: ''
}

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { values, errors, handleChange, handleSubmit } = useForm<SignupForm>({
    initialValues,
    validate: {
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (value) => {
        if (value !== values.password) {
          return '비밀번호가 일치하지 않습니다'
        }
      },
      nickname: validateNickname,
      phoneNumber: validatePhoneNumber
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        setError(null)
        await signup(values.email, values.password)
        navigate('/profile/setup')
      } catch (err) {
        setError('회원가입 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  })

  return (
    <AuthLayout
      title="회원가입"
      subtitle="CarryOn과 함께 시작하세요"
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
          autoComplete="new-password"
        />

        <FormInput
          label="비밀번호 확인"
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <FormInput
          label="닉네임"
          type="text"
          name="nickname"
          value={values.nickname}
          onChange={handleChange}
          error={errors.nickname}
          required
          autoComplete="nickname"
        />

        <FormInput
          label="전화번호"
          type="tel"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          required
          autoComplete="tel"
          placeholder="010-0000-0000"
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          회원가입
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
          이미 계정이 있으신가요?{' '}
          <Link 
            to="/login" 
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            로그인
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
} 