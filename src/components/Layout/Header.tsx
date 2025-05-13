import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/Button'

export default function Header() {
  const { user, profile, logout, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return null

  return (
    <header className="w-full px-4 py-3 border-b bg-white shadow-sm flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-700">CarryOn</Link>
      <nav className="flex items-center gap-4 text-sm text-gray-600">
        <Link to="/requests">요청 목록</Link>
        <Link to="/mypage">마이페이지</Link>

        {!user && (
          <Link to="/login">로그인</Link>
        )}

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 transition text-white font-semibold"
              onClick={() => setDropdownOpen(prev => !prev)}
              title="프로필"
            >
              {(profile?.nickname?.[0] || 'M').toUpperCase()}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 space-y-4">
                {/* 로그인 정보 */}
                <div className="text-sm">
                  <p className="text-xs text-gray-500 mb-1">로그인 계정</p>
                  <p className="font-medium text-gray-800 truncate">{user.email}</p>
                  <Link to="/mypage" className="mt-2 block text-blue-600 hover:underline text-sm">내 정보 보기</Link>
                </div>

                {/* 캐리어 기능 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">캐리어 기능</p>
                  <Link to="/trip/new" className="block px-3 py-1 rounded hover:bg-blue-50 transition">+ 여정 등록하기</Link>
                  <Link to="/mypage?tab=carrier" className="block px-3 py-1 rounded hover:bg-blue-50 transition">매칭 상태 보기</Link>
                </div>

                {/* 바이어 기능 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">바이어 기능</p>
                  <Link to="/request/new" className="block px-3 py-1 rounded hover:bg-blue-50 transition">+ 배송 요청하기</Link>
                  <Link to="/mypage?tab=buyer" className="block px-3 py-1 rounded hover:bg-blue-50 transition">내 요청 관리</Link>
                </div>

                {/* 로그아웃 */}
                <div className="pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={logout} className="w-full">로그아웃</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
