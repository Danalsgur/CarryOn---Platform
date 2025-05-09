import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import RequireCompleteProfile from './components/RequireCompleteProfile'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import ProfileSetup from './pages/ProfileSetup'
import Mypage from './pages/Mypage'
import RequestNew from './pages/RequestNew'
import RequestDetail from './pages/RequestDetail'
import RequestList from './pages/RequestList'
import RequestEdit from './pages/RequestEdit'
import TripNew from './pages/TripNew'
import TripEdit from './pages/TripEdit'

function App() {
  // 🔄 탭 포커스 복귀 시 새로고침
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 탭으로 복귀됨 → 강제 새로고침 실행!')
        window.location.reload()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <Routes>
      {/* ❌ Layout 없이 보여야 하는 페이지들 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ✅ Layout 적용되는 라우트들 */}
      <Route element={<Layout />}>
        {/* 🔓 공개 페이지 */}
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<RequestList />} />
        <Route path="/request/:id" element={<RequestDetail />} />

        {/* 🔐 로그인 + 프로필 완료 필요한 페이지 */}
        <Route element={<RequireCompleteProfile />}>
          <Route path="/profile/setup" element={<ProfileSetup />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/request/new" element={<RequestNew />} />
          <Route path="/request/edit/:id" element={<RequestEdit />} />
          <Route path="/trip/new" element={<TripNew />} />
          <Route path="/trip/edit/:id" element={<TripEdit />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
