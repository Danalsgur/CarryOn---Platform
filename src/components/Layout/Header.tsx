import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    console.log('⏳ Header: auth 로딩 중... 렌더링 보류')
    return null
  }

  console.log('🧠 Header context log ---')
  console.log('👤 user:', user)
  console.log('🏷️ profile:', profile)

  return (
    <header className="w-full px-4 py-3 border-b bg-white shadow-sm flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-700">CarryOn</Link>
      <nav className="space-x-4 text-sm text-gray-600">
        <Link to="/requests">요청 목록</Link>
        <Link to="/mypage">마이페이지</Link>

        {!user && (
          <Link to="/login">로그인</Link> // ✅ 회원가입 제거
        )}
      </nav>
    </header>
  )
}
