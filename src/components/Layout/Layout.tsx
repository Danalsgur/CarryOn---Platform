// src/components/Layout/Layout.tsx
import { memo } from 'react'
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'

const Layout = memo(function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
})

Layout.displayName = 'Layout'

export default Layout
