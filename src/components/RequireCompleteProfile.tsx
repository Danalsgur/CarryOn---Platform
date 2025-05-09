import { useAuth } from '../contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

export default function RequireCompleteProfile() {
  const { loading, user, profile } = useAuth()

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        프로필 확인 중...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const isIncomplete = !profile?.name || !profile?.nickname || !profile?.phone
  if (isIncomplete) return <Navigate to="/profile/setup" replace />

  return <Outlet />
}
