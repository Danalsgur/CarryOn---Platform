import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/Button'
import { User, Settings, Package, Plane, LogOut, ChevronRight, Home, Menu, X } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { user, profile, logout, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 드롭다운 메뉴 외부 클릭 처리
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      
      // 모바일 메뉴 외부 클릭 처리
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return null

  return (
    <header className="w-full px-4 md:px-6 py-4 border-b bg-surface shadow-card flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-brand-dark">
        CarryOn
      </Link>
      
      {/* 데스크톱 네비게이션 */}
      <nav className="hidden md:flex items-center gap-4 text-sm text-text-secondary">
        <Link to="/" className="hover:text-brand transition-colors duration-200 flex items-center gap-1">
          <Home size={16} />
          홈
        </Link>
        <Link to="/requests" className="hover:text-brand transition-colors duration-200 flex items-center gap-1">
          <Package size={16} />
          요청 목록
        </Link>
        <Link to="/mypage" className="hover:text-brand transition-colors duration-200 flex items-center gap-1">
          <User size={16} />
          마이페이지
        </Link>

        {!user && (
          <Button size="sm" onClick={() => navigate('/login')}>로그인</Button>
        )}

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-brand hover:bg-brand-light/10 transition-all duration-200"
              onClick={() => setDropdownOpen(prev => !prev)}
              title="프로필 메뉴"
            >
              <div className="w-7 h-7 rounded-full bg-brand text-white font-semibold flex items-center justify-center text-sm">
                {(profile?.nickname?.[0] || 'M').toUpperCase()}
              </div>
              <span className="text-text-secondary font-medium">{profile?.nickname || '프로필'}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-surface border border-gray-200 rounded-layout shadow-card z-50 overflow-hidden transition-all duration-300 ease-in-out">
                {/* 헤더 영역 */}
                <div className="bg-brand/5 p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand text-white font-semibold flex items-center justify-center">
                      {(profile?.nickname?.[0] || 'M').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{profile?.nickname || '프로필'}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link 
                      to="/profile" 
                      className="flex items-center justify-between w-full text-sm text-brand hover:text-brand-dark transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      회원 정보 관리
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* 캐리어 기능 */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Plane size={14} />
                    캐리어 기능
                  </p>
                  <div className="space-y-1">
                    <Link 
                      to="/trip/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-brand">+</span> 여정 등록하기
                    </Link>
                    <Link 
                      to="/mypage?tab=carrier" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      매칭 상태 보기
                    </Link>
                  </div>
                </div>

                {/* 바이어 기능 */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Package size={14} />
                    바이어 기능
                  </p>
                  <div className="space-y-1">
                    <Link 
                      to="/request/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-brand">+</span> 배송 요청하기
                    </Link>
                    <Link 
                      to="/mypage?tab=buyer" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      내 요청 관리
                    </Link>
                  </div>
                </div>

                {/* 로그아웃 */}
                <div className="p-4">
                  <button 
                    onClick={() => {
                      logout()
                      setDropdownOpen(false)
                      navigate('/')
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-red-50 text-red-600 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* 모바일 메뉴 버튼 */}
      <button 
        className="md:hidden flex items-center justify-center w-10 h-10 text-text-secondary hover:text-brand transition-colors duration-200"
        onClick={() => setMobileMenuOpen(prev => !prev)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 bg-white md:hidden transition-transform duration-300 ease-in-out"
          style={{ top: '60px' }}
        >
          <div className="p-4 space-y-6 max-h-[calc(100vh-60px)] overflow-y-auto">
            {user && (
              <div className="flex items-center gap-3 p-4 bg-brand/5 rounded-layout">
                <div className="w-12 h-12 rounded-full bg-brand text-white font-semibold flex items-center justify-center text-lg">
                  {(profile?.nickname?.[0] || 'M').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{profile?.nickname || '프로필'}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Link 
                to="/" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                홈
              </Link>
              <Link 
                to="/requests" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package size={20} />
                요청 목록
              </Link>
              <Link 
                to="/mypage" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                마이페이지
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings size={20} />
                회원 정보 관리
              </Link>
            </div>

            {user && (
              <>
                {/* 캐리어 기능 */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Plane size={16} />
                    캐리어 기능
                  </p>
                  <div className="space-y-1 pl-8">
                    <Link 
                      to="/trip/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-brand">+</span> 여정 등록하기
                    </Link>
                    <Link 
                      to="/mypage?tab=carrier" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      매칭 상태 보기
                    </Link>
                  </div>
                </div>

                {/* 바이어 기능 */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Package size={16} />
                    바이어 기능
                  </p>
                  <div className="space-y-1 pl-8">
                    <Link 
                      to="/request/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-brand">+</span> 배송 요청하기
                    </Link>
                    <Link 
                      to="/mypage?tab=buyer" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      내 요청 관리
                    </Link>
                  </div>
                </div>

                {/* 로그아웃 */}
                <div className="pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                      navigate('/')
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-red-50 text-red-600 transition-colors duration-200"
                  >
                    <LogOut size={20} />
                    로그아웃
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full"
                >
                  로그인 / 회원가입
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
