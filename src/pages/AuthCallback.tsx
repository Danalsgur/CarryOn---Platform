import { useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ 세션 복원 실패:', error.message)
        navigate('/login')
        return
      }

      // ✅ 자동 로그인 완료 → 마이페이지 이동
      navigate('/mypage')
    }

    handleAuth()
  }, [])

  return (
    <div className="text-center mt-32 text-lg text-gray-600">
      로그인 중입니다... 잠시만 기다려주세요.
    </div>
  )
}
