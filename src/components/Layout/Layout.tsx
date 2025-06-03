// src/components/layout/Layout.tsx
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
