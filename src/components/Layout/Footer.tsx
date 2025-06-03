// src/components/Layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full px-4 md:px-6 py-6 bg-background border-t text-center text-sm text-text-muted">
      © 2025 CarryOn. All rights reserved. · 
      <a href="#" className="text-brand hover:text-brand-dark transition-colors duration-200">이용약관</a> · 
      <a href="#" className="text-brand hover:text-brand-dark transition-colors duration-200">개인정보 처리방침</a>
    </footer>
  )
}