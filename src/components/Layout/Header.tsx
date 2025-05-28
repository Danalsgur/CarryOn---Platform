import { useState, useRef, useEffect, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/Button'

const Header = memo(function Header() {
  const { user, profile, logout, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 드롭다운이 열려있을 때 ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [dropdownOpen])

  // 페이지 이동 시 드롭다운 닫기
  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  if (loading) return null

  return (
    <header className="w-full px-4 py-3 border-b bg-white shadow-sm flex justify-between items-center sticky top-0 z-50">
      <Link 
        to="/" 
        className="text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors"
        aria-label="CarryOn 홈으로 이동"
      >
        CarryOn
      </Link>
      <nav className="flex items-center gap-4 text-sm text-gray-600" role="navigation" aria-label="메인 네비게이션">
        <Link 
          to="/requests" 
          className="hover:text-blue-600 transition-colors"
          aria-current={location.pathname === '/requests' ? 'page' : undefined}
        >
          요청 목록
        </Link>
        <Link 
          to="/mypage" 
          className="hover:text-blue-600 transition-colors"
          aria-current={location.pathname === '/mypage' ? 'page' : undefined}
        >
          마이페이지
        </Link>

        {!user && (
          <Link 
            to="/login" 
            className="hover:text-blue-600 transition-colors"
            aria-current={location.pathname === '/login' ? 'page' : undefined}
          >
            로그인
          </Link>
        )}

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 transition text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="프로필 메뉴"
            >
              {(profile?.nickname?.[0] || 'M').toUpperCase()}
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 space-y-4"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="profile-menu"
              >
                {/* 로그인 정보 */}
                <div className="text-sm">
                  <p className="text-xs text-gray-500 mb-1">로그인 계정</p>
                  <p className="font-medium text-gray-800 truncate">{user.email}</p>
                  <Link 
                    to="/mypage" 
                    className="mt-2 block text-blue-600 hover:underline text-sm"
                    role="menuitem"
                  >
                    내 정보 보기
                  </Link>
                </div>

                {/* 캐리어 기능 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">캐리어 기능</p>
                  <Link 
                    to="/trip/new" 
                    className="block px-3 py-1 rounded hover:bg-blue-50 transition"
                    role="menuitem"
                  >
                    + 여정 등록하기
                  </Link>
                  <Link 
                    to="/mypage?tab=carrier" 
                    className="block px-3 py-1 rounded hover:bg-blue-50 transition"
                    role="menuitem"
                  >
                    매칭 상태 보기
                  </Link>
                </div>

                {/* 바이어 기능 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">바이어 기능</p>
                  <Link 
                    to="/request/new" 
                    className="block px-3 py-1 rounded hover:bg-blue-50 transition"
                    role="menuitem"
                  >
                    + 배송 요청하기
                  </Link>
                  <Link 
                    to="/mypage?tab=buyer" 
                    className="block px-3 py-1 rounded hover:bg-blue-50 transition"
                    role="menuitem"
                  >
                    내 요청 관리
                  </Link>
                </div>

                {/* 로그아웃 */}
                <div className="pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logout} 
                    className="w-full"
                    role="menuitem"
                  >
                    로그아웃
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
})

Header.displayName = 'Header'

export default Header
