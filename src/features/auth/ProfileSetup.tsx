import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { useForm } from '@/hooks/form/useForm'
import { validateNickname, validatePhoneNumber } from '@/utils/validation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { FormInput } from '@/components/forms/FormInput'

interface ProfileSetupForm {
  nickname: string
  phoneNumber: string
  role: 'buyer' | 'carrier' | 'both'
}

const initialValues: ProfileSetupForm = {
  nickname: '',
  phoneNumber: '',
  role: 'buyer'
}

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { values, errors, handleChange, handleSubmit } = useForm<ProfileSetupForm>({
    initialValues,
    validate: {
      nickname: validateNickname,
      phoneNumber: validatePhoneNumber
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        setError(null)
        await updateProfile({
          nickname: values.nickname,
          phoneNumber: values.phoneNumber,
          role: values.role
        })
        navigate('/')
      } catch (err) {
        setError('프로필 설정 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  })

  return (
    <AuthLayout
      title="프로필 설정"
      subtitle="CarryOn을 시작하기 위한 마지막 단계입니다"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            역할
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                id="buyer"
                name="role"
                type="radio"
                value="buyer"
                checked={values.role === 'buyer'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="buyer" className="ml-3 block text-sm text-gray-700">
                구매자
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="carrier"
                name="role"
                type="radio"
                value="carrier"
                checked={values.role === 'carrier'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="carrier" className="ml-3 block text-sm text-gray-700">
                배송자
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="both"
                name="role"
                type="radio"
                value="both"
                checked={values.role === 'both'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="both" className="ml-3 block text-sm text-gray-700">
                둘 다
              </label>
            </div>
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
          프로필 설정 완료
        </Button>
      </form>
    </AuthLayout>
  )
} 