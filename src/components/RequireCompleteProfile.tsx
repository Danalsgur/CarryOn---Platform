import { useAuth } from '../contexts/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function RequireCompleteProfile() {
  const { loading, user, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        로그인 상태 확인 중입니다...
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  const isIncomplete =
    !profile || !profile.name || !profile.nickname || !profile.phone

  if (isIncomplete) {
    return <Navigate to="/profile/setup" replace />
  }

  return <Outlet />
}
