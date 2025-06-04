// pages/ResetPasswordUpdate.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import Header from '../components/Layout/Header'
import { useNavigate } from 'react-router-dom'
import { PasswordInput } from '../components/Password'

export default function ResetPasswordUpdate() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 페이지 로드 시 유효한 세션인지 확인
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        setError('유효하지 않은 비밀번호 재설정 링크입니다. 다시 시도해주세요.')
      }
    }
    
    checkSession()
  }, [])

  const handleUpdate = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    
    // 비밀번호 일치 여부 확인
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setError(error.message)
      } else {
        setMessage('비밀번호가 성공적으로 변경되었습니다. 이제 로그인해주세요.')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      console.error('비밀번호 업데이트 오류:', err)
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout mt-12 border shadow">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">새 비밀번호 설정</h2>
          
          <div className="space-y-4">
            <PasswordInput
              label="새 비밀번호"
              value={newPassword}
              setValue={setNewPassword}
              showRequirements={true}
              showStrengthMeter={true}
            />
            
            <PasswordInput
              label="비밀번호 확인"
              value={confirmPassword}
              setValue={setConfirmPassword}
              showRequirements={false}
              showStrengthMeter={false}
            />
            
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-danger text-xs">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>
          
          {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
          
          <Button 
            onClick={handleUpdate} 
            className="w-full mt-6" 
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            {loading ? '처리 중...' : '비밀번호 변경'}
          </Button>
        </div>
      </div>
    </div>
  )
}
