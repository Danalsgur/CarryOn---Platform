// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Mypage from './pages/Mypage'
import RequestNew from './pages/RequestNew'
import RequestDetail from './pages/RequestDetail'
import RequestList from './pages/RequestList' // ✅ 추가
import TripNew from './pages/TripNew'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mypage" element={<Mypage />} />
      <Route path="/request/new" element={<RequestNew />} />
      <Route path="/request/:id" element={<RequestDetail />} />
      <Route path="/requests" element={<RequestList />} /> {/* ✅ 리스트 경로 추가 */}
      <Route path="/trip/new" element={<TripNew />} />
    </Routes>
  )
}

export default App
