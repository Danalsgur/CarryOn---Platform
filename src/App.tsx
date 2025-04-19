import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'

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
  return (
    <Routes>
      {/* ❌ Layout 없이 보여야 하는 페이지들 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ✅ Layout 씌워야 하는 페이지들 */}
        <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/profile/setup" element={<ProfileSetup />} />
        <Route path="/requests" element={<RequestList />} />
        <Route path="/request/new" element={<RequestNew />} />
        <Route path="/request/:id" element={<RequestDetail />} />
        <Route path="/trip/new" element={<TripNew />} />
      </Route>
    </Routes>
  )
}

export default App
