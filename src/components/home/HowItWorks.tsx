import { Plane, Search, MessageCircle, Package, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    {
      step: 'STEP 1',
      title: t('home.howItWorks.step1'),
      description: t('home.howItWorks.step1Desc'),
      icon: <Plane size={24} />
    },
    {
      step: 'STEP 2',
      title: t('home.howItWorks.step2'),
      description: t('home.howItWorks.step2Desc'),
      icon: <Search size={24} />
    },
    {
      step: 'STEP 3',
      title: t('home.howItWorks.step3'),
      description: t('home.howItWorks.step3Desc'),
      icon: <MessageCircle size={24} />
    },
    {
      step: 'STEP 4',
      title: t('home.howItWorks.step4'),
      description: t('home.howItWorks.step4Desc'),
      icon: <Package size={24} />
    },
    {
      step: 'STEP 5',
      title: t('home.howItWorks.step5'),
      description: t('home.howItWorks.step5Desc'),
      icon: <Wallet size={24} />
    },
  ]

  return (
    <section className="py-16 bg-surface">
      <h2 className="text-2xl font-bold text-center text-text-primary mb-8">
        {t('home.howItWorks.title')}
      </h2>

      <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-brand-light/20 rounded-layout p-6 text-center shadow-card hover:shadow-lg transition-all duration-200 space-y-4 hover:translate-y-[-2px]"
          >
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                {step.icon}
              </div>
            </div>
            <div className="text-sm font-semibold text-brand">{step.step}</div>
            <h3 className="text-lg font-bold text-brand-dark">{step.title}</h3>
            <p className="text-text-secondary text-sm">{step.description}</p>
          </div>
        ))}
      </div>

      {/* 사용자 역할 설명 섹션 */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-center text-text-primary mb-6">
          {t('home.howItWorks.rolesTitle')}
        </h3>
        <p className="text-center text-text-secondary text-base max-w-xl mx-auto mb-6">
          {t('home.howItWorks.rolesDesc')}
        </p>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 text-center">
          <div className="bg-surface p-6 rounded-layout shadow-card border border-gray-200 space-y-4 hover:shadow-lg transition-all duration-200 hover:border-brand/30">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-brand">
                <Package size={28} />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-brand">{t('home.howItWorks.buyerTitle')}</h4>
            <ul className="text-text-secondary text-sm space-y-3">
             <li className="flex items-start gap-2">
               <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                 <Package size={16} />
               </div>
               <span>{t('home.howItWorks.buyerRole1')}</span>
             </li>
             <li className="flex items-start gap-2">
               <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                 <MessageCircle size={16} />
               </div>
               <span>{t('home.howItWorks.buyerRole2')}</span>
             </li>
             <li className="flex items-start gap-2">
               <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                 <Wallet size={16} />
               </div>
               <span>{t('home.howItWorks.buyerRole3')}</span>
             </li>
            </ul>
          </div>
          <div className="bg-surface p-6 rounded-layout shadow-card border border-gray-200 space-y-4 hover:shadow-lg transition-all duration-200 hover:border-brand/30">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-brand">
                <Plane size={28} />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-brand">{t('home.howItWorks.carrierTitle')}</h4>
            <ul className="text-text-secondary text-sm space-y-3">
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                  <Plane size={16} />
                </div>
                <span>{t('home.howItWorks.carrierRole1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                  <Search size={16} />
                </div>
                <span>{t('home.howItWorks.carrierRole2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                  <Wallet size={16} />
                </div>
                <span>{t('home.howItWorks.carrierRole3')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
