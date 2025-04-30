// RequireCompleteProfile.tsx
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'

export default function RequireCompleteProfile({ children }: { children: ReactNode }) {
  const { loading, profile } = useAuth()

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        프로필 확인 중...
      </div>
    )
  }

  const isIncomplete = !profile?.name || !profile?.nickname || !profile?.phone
  if (isIncomplete) return <Navigate to="/profile/setup" replace />

  return children
}
