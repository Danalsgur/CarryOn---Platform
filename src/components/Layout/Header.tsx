// src/components/Layout/Header.tsx
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, profile, logout, loading } = useAuth()

  // ✅ 세션이 아직 복구 중이면, 헤더 안 보여줌
  if (loading) {
    console.log('⏳ Header: auth 로딩 중... 렌더링 보류')
    return null
  }

  console.log('🧠 Header context log ---')
  console.log('👤 user:', user)
  console.log('🏷️ profile:', profile)
  console.log('🚪 logout:', logout)

  return (
    <header className="w-full px-4 py-3 border-b bg-white shadow-sm flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-700">CarryOn</Link>
      <nav className="space-x-4 text-sm text-gray-600">
        <Link to="/requests">요청 목록</Link>
        <Link to="/mypage">마이페이지</Link>

        {user ? (
          <>
            <span className="text-blue-600 font-medium">
              {profile?.nickname ?? user.email}
            </span>
            <button
              onClick={() => {
                console.log('🧨 로그아웃 버튼 클릭됨')
                logout()
              }}
              className="text-red-500 hover:underline"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  )
}
