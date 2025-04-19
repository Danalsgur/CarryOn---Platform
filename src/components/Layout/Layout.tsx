// src/components/Layout/Layout.tsx
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* ✅ 여기에 자식 라우트들이 들어옴 */}
      </main>
      <Footer />
    </div>
  )
}
