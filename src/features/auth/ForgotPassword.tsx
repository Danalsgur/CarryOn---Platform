import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { useForm } from '@/hooks/form/useForm'
import { validateEmail } from '@/utils/validation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { FormInput } from '@/components/forms/FormInput'

interface ForgotPasswordForm {
  email: string
}

const initialValues: ForgotPasswordForm = {
  email: ''
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const { values, errors, handleChange, handleSubmit } = useForm<ForgotPasswordForm>({
    initialValues,
    validate: {
      email: validateEmail
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        setError(null)
        await resetPassword(values.email)
        setIsSuccess(true)
      } catch (err) {
        setError('비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  })

  if (isSuccess) {
    return (
      <AuthLayout
        title="이메일 전송 완료"
        subtitle="비밀번호 재설정 링크를 이메일로 전송했습니다"
      >
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            입력하신 이메일 주소로 비밀번호 재설정 링크를 전송했습니다.
            이메일을 확인하여 비밀번호를 재설정해주세요.
          </p>
          <Link
            to="/login"
            className="inline-block font-medium text-blue-600 hover:text-blue-800"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="비밀번호 재설정"
      subtitle="이메일 주소를 입력해주세요"
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

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          비밀번호 재설정 링크 전송
        </Button>

        <p className="text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            로그인 페이지로 돌아가기
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
} 