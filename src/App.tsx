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
import TripNew from './pages/TripNew'

function App() {
  // 🔥 탭 포커스 복귀 시 강제 새로고침
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

      {/* ✅ Layout 씌워야 하는 페이지들 */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/setup" element={<ProfileSetup />} />

        <Route
          path="/mypage"
          element={
            <RequireCompleteProfile>
              <Mypage />
            </RequireCompleteProfile>
          }
        />
        <Route
          path="/requests"
          element={
            <RequireCompleteProfile>
              <RequestList />
            </RequireCompleteProfile>
          }
        />
        <Route
          path="/request/new"
          element={
            <RequireCompleteProfile>
              <RequestNew />
            </RequireCompleteProfile>
          }
        />
        <Route
          path="/request/:id"
          element={
            <RequireCompleteProfile>
              <RequestDetail />
            </RequireCompleteProfile>
          }
        />
        <Route
          path="/trip/new"
          element={
            <RequireCompleteProfile>
              <TripNew />
            </RequireCompleteProfile>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
