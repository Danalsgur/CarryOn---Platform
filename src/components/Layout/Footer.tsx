// src/components/Layout/Footer.tsx
import { memo } from 'react'
import { Link } from 'react-router-dom'

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="w-full px-4 py-6 bg-gray-50 border-t text-center text-sm text-gray-500"
      role="contentinfo"
    >
      <div className="max-w-4xl mx-auto">
        <p className="mb-4">
          © {currentYear} CarryOn. All rights reserved.
        </p>
        <nav className="flex justify-center gap-4" aria-label="푸터 링크">
          <Link 
            to="/terms" 
            className="hover:text-blue-600 transition-colors"
          >
            이용약관
          </Link>
          <Link 
            to="/privacy" 
            className="hover:text-blue-600 transition-colors"
          >
            개인정보 처리방침
          </Link>
          <a 
            href="mailto:support@carryon.com" 
            className="hover:text-blue-600 transition-colors"
          >
            문의하기
          </a>
        </nav>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

export default Footer
  