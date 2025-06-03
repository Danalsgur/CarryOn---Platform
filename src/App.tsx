import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import RequireCompleteProfile from './components/RequireCompleteProfile'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import ProfileSetup from './pages/ProfileSetup'
import ProfileEdit from './pages/ProfileEdit'
import Mypage from './pages/Mypage'
import RequestNew from './pages/RequestNew'
import RequestDetail from './pages/RequestDetail'
import RequestList from './pages/RequestList'
import RequestEdit from './pages/RequestEdit'
import TripNew from './pages/TripNew'
import TripEdit from './pages/TripEdit'
import ResetPasswordRequest from './pages/ResetPasswordRequest'
import ResetPasswordUpdate from './pages/ResetPasswordUpdate'
import RequestManage from './pages/RequestManage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      {/* ❌ Layout 없이 보여야 하는 페이지들 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPasswordRequest />} />
      <Route path="/reset-password/update" element={<ResetPasswordUpdate />} />

      {/* ✅ Layout 적용되는 라우트들 */}
      <Route element={<Layout />}>
        {/* 공개 페이지 */}
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<RequestList />} />
        <Route path="/request/:id" element={<RequestDetail />} />

        {/* 🔓 프로필 미완성 유저도 접근 가능 */}
        <Route path="/profile/setup" element={<ProfileSetup />} />

        {/* 🔐 프로필 완료된 유저만 접근 가능 */}
        <Route element={<RequireCompleteProfile />}>
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/request/new" element={<RequestNew />} />
          <Route path="/request/edit/:id" element={<RequestEdit />} />
          <Route
            path="/request/manage/:id"
            element={<RequestManage />}
          />
          <Route path="/trip/new" element={<TripNew />} />
          <Route path="/trip/edit/:id" element={<TripEdit />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
