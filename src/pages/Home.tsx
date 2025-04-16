// src/pages/Home.tsx

import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-blue-50 px-4">
      <h1 className="text-3xl font-bold text-blue-800">CarryOn 🔧 테스트 홈</h1>
      <p className="text-gray-600">빠르게 각 기능 테스트하려면 아래 버튼을 누르세요.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        <Button onClick={() => navigate('/login')}>로그인</Button>
        <Button onClick={() => navigate('/signup')}>회원가입</Button>
        <Button onClick={() => navigate('/mypage')}>마이페이지</Button>
        <Button onClick={() => navigate('/requests')}>요청 리스트</Button>
        <Button onClick={() => navigate('/request/new')}>요청 등록</Button>
        <Button onClick={() => navigate('/trip/new')}>여정 등록</Button> {/* ✅ 이거 추가 */}
        <Button onClick={() => navigate('/request/1')}>요청 상세 (예시)</Button>
      </div>
    </div>
  )
}

export default Home

