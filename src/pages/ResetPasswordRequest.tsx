// pages/ResetPasswordRequest.tsx
import { useState } from 'react'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import Header from '../components/Layout/Header'

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setMessage('')
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/update`,
    })
    if (error) setError(error.message)
    else setMessage(`${email}로 재설정 링크를 보냈어요. 메일함을 확인해주세요.`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout mt-12 border shadow">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">비밀번호 재설정</h2>
          <Input label="이메일" value={email} setValue={setEmail} type="email" />
          {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
          <Button onClick={handleSubmit} className="w-full mt-6">
            이메일로 재설정 링크 받기
          </Button>
        </div>
      </div>
    </div>
  )
}
