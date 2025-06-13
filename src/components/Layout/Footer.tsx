// src/components/Layout/Footer.tsx
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="w-full px-4 md:px-6 py-6 bg-background border-t text-center text-sm text-text-muted">
      {t('footer.copyright', { year: 2025 })} · 
      <a href="#" className="text-brand hover:text-brand-dark transition-colors duration-200">{t('footer.termsOfService')}</a> · 
      <a href="#" className="text-brand hover:text-brand-dark transition-colors duration-200">{t('footer.privacyPolicy')}</a>
    </footer>
  )
}