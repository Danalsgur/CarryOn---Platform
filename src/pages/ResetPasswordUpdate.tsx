// pages/ResetPasswordUpdate.tsx
import { useState } from 'react'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import Header from '../components/Layout/Header'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordUpdate() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdate = async () => {
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) setError(error.message)
    else {
      setMessage('비밀번호가 변경되었습니다. 이제 로그인해주세요.')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout mt-12 border shadow">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">새 비밀번호 설정</h2>
          <Input label="새 비밀번호" value={newPassword} setValue={setNewPassword} type="password" />
          {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
          <Button onClick={handleUpdate} className="w-full mt-6">비밀번호 변경</Button>
        </div>
      </div>
    </div>
  )
}
