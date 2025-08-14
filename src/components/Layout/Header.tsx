import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import { User, Package, Plane, LogOut, ChevronRight, Home, Menu, X, Bell } from 'lucide-react'
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../../utils/notifications'
import SimpleLanguageSwitcher from '../SimpleLanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile, logout, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  
  // 모바일 메뉴가 열렸을 때 body 스크롤 방지
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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

      // 알림 메뉴 외부 클릭 처리
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 알림 데이터 로드
  useEffect(() => {
    const loadNotifications = async () => {
      if (user) {
        const notifs = await getNotifications(user.id)
        setNotifications(notifs)
        const count = await getUnreadNotificationsCount(user.id)
        setUnreadCount(count)
      }
    }

    loadNotifications()
    
    // 30초마다 알림 업데이트
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  // 알림 읽음 처리
  const handleNotificationClick = async (notificationId: string, link: string) => {
    await markNotificationAsRead(notificationId)
    // 알림 목록 업데이트
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, is_read: true } : notif
    ))
    // 읽지 않은 알림 수 업데이트
    setUnreadCount(prev => Math.max(0, prev - 1))
    // 링크로 이동
    navigate(link)
    setNotificationOpen(false)
  }

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllNotificationsAsRead(user.id)
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })))
      setUnreadCount(0)
    }
  }

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
          {t('navigation.home')}
        </Link>
        <Link to="/requests" className="hover:text-brand transition-colors duration-200 flex items-center gap-1">
          <Package size={16} />
          {t('navigation.requests')}
        </Link>
        <Link to="/mypage" className="hover:text-brand transition-colors duration-200 flex items-center gap-1">
          <User size={16} />
          {t('navigation.myPage')}
        </Link>
        
        {/* 언어 전환 컴포넌트 */}
        <SimpleLanguageSwitcher />
        
        {user && (
          <div className="relative" ref={notificationRef}>
            <button
              className="hover:text-brand transition-colors duration-200 flex items-center gap-1 relative"
              onClick={() => setNotificationOpen(prev => !prev)}
              title="알림"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-gray-200 rounded-layout shadow-card z-50 overflow-hidden transition-all duration-300 ease-in-out">
                {/* 알림 헤더 */}
                <div className="bg-brand/5 p-3 border-b border-gray-200 flex justify-between items-center">
                  <p className="font-medium text-text-primary">알림</p>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-brand hover:text-brand-dark transition-colors duration-200"
                    >
                      모두 읽음 표시
                    </button>
                  )}
                </div>

                {/* 알림 목록 */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">
                      알림이 없습니다
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${!notification.is_read ? 'bg-brand/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${!notification.is_read ? 'bg-brand' : 'bg-gray-300'}`} />
                          <div>
                            <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                            <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
                            <p className="text-xs text-text-muted mt-1">
                              {new Date(notification.created_at).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!user && (
          <Button size="sm" onClick={() => navigate('/login')}>
            {t('common.login')}
          </Button>
        )}

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-brand hover:bg-brand-light/10 transition-all duration-200"
              onClick={() => setDropdownOpen(prev => !prev)}
              title={t('common.profileMenu')}
            >
              <div className="w-7 h-7 rounded-full bg-brand text-white font-semibold flex items-center justify-center text-sm">
              {(profile?.nickname?.[0] || 'M').toUpperCase()}
              </div>
              <span className="text-text-secondary font-medium">{profile?.nickname || t('common.profile')}</span>
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
                      <p className="font-medium text-text-primary">{profile?.nickname || t('common.profile')}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link 
                      to="/profile" 
                      className="flex items-center justify-between w-full text-sm text-brand hover:text-brand-dark transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t('common.profileSettings')}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* 캐리어 기능 */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Plane size={14} />
                    {t('navigation.carrierFeatures')}
                  </p>
                  <div className="space-y-1">
                    <Link 
                      to="/trip/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-brand">+</span> {t('navigation.createTrip')}
                    </Link>
                    <Link 
                      to="/mypage?tab=carrier" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t('navigation.tripStatus')}
                    </Link>
                  </div>
                </div>

                {/* 바이어 기능 */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Package size={14} />
                    {t('navigation.buyerFeatures')}
                  </p>
                  <div className="space-y-1">
                    <Link 
                      to="/request/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-brand">+</span> {t('navigation.createRequest')}
                    </Link>
                    <Link 
                      to="/mypage?tab=buyer" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t('navigation.requestStatus')}
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
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* 모바일 영역 버튼들 */}
      <div className="md:hidden flex items-center gap-2">
        {/* 언어 토글 버튼 */}
        <SimpleLanguageSwitcher />
        
        {/* 모바일 알림 버튼 */}
        {user && (
          <div className="relative" ref={notificationRef}>
            <button
              className="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-brand transition-colors duration-200 relative"
              onClick={() => setNotificationOpen(prev => !prev)}
              title={t('common.notifications')}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* 알림 드롭다운 */}
            {notificationOpen && (
              <div className="fixed top-[4rem] right-2 w-80 max-w-[calc(100vw-1rem)] bg-surface border border-gray-200 rounded-layout shadow-card z-[1000] overflow-hidden transition-all duration-300 ease-in-out">
                {/* 알림 헤더 */}
                <div className="bg-brand/5 p-3 border-b border-gray-200 flex justify-between items-center">
                  <p className="font-medium text-text-primary">{t('common.notifications')}</p>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-brand hover:text-brand-dark transition-colors duration-200"
                    >
                      {t('common.markAllAsRead')}
                    </button>
                  )}
                </div>

                {/* 알림 목록 */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">
                      {t('common.noNotifications')}
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${!notification.is_read ? 'bg-brand/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${!notification.is_read ? 'bg-brand' : 'bg-gray-300'}`} />
                          <div>
                            <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                            <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
                            <p className="text-xs text-text-muted mt-1">
                              {new Date(notification.created_at).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 햄버거 메뉴 버튼 */}
        <button 
          className="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-brand transition-colors duration-200"
          onClick={() => setMobileMenuOpen(prev => !prev)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 모바일 메뉴 - 화면 전체를 차지하도록 변경 */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 bg-white md:hidden transition-all duration-300 ease-in-out flex flex-col"
        >
          {/* 모바일 메뉴 헤더 */}
          <div className="flex justify-between items-center px-4 py-4 border-b bg-surface shadow-sm">
            <Link to="/" className="text-xl font-bold text-brand-dark" onClick={() => setMobileMenuOpen(false)}>
              CarryOn
            </Link>
            <button 
              className="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-brand transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* 모바일 메뉴 콘텐츠 */}
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">

            <div className="space-y-1">
              <Link 
                to="/" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                {t('navigation.home')}
              </Link>
              <Link 
                to="/requests" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package size={20} />
                {t('navigation.requests')}
              </Link>
              <Link 
                to="/mypage" 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                {t('navigation.myPage')}
              </Link>
            </div>

            {user && (
              <>
                {/* 캐리어 기능 */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Plane size={16} />
                    {t('navigation.carrierFeatures')}
                  </p>
                  <div className="space-y-1 pl-8">
                    <Link 
                      to="/trip/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-brand">+</span> {t('navigation.createTrip')}
                    </Link>
                    <Link 
                      to="/mypage?tab=carrier" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('navigation.tripStatus')}
                    </Link>
                  </div>
                </div>

                {/* 바이어 기능 */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Package size={16} />
                    {t('navigation.buyerFeatures')}
                  </p>
                  <div className="space-y-1 pl-8">
                    <Link 
                      to="/request/new" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-brand">+</span> {t('navigation.createRequest')}
                    </Link>
                    <Link 
                      to="/mypage?tab=buyer" 
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-control hover:bg-brand-light/20 transition-colors duration-200 text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('navigation.requestStatus')}
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
                    {t('common.logout')}
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
                  {t('common.loginSignup')}
                </Button>
              </div>
            )}
            
            {/* 모바일 언어 전환 */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-text-muted mb-3">{t('navigation.languageSettings')}</p>
              <div className="flex justify-center">
                <SimpleLanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
