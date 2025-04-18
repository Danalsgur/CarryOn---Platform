// src/components/Layout/Header.tsx
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="w-full px-4 py-3 border-b bg-white shadow-sm flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-700">CarryOn</Link>
      <nav className="space-x-4 text-sm text-gray-600">
        <Link to="/requests">요청 목록</Link>
        <Link to="/mypage">마이페이지</Link>
        <Link to="/login">로그인</Link>
      </nav>
    </header>
  )
}
