import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { calculateSuggestedReward, Item } from '../../utils/rewardCalculator'
import { PlusCircle, Settings, DollarSign, ShoppingBag, Percent } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const examples: {
  titleKey: string
  items: Item[]
  retailPrice: number
  retailCurrency: string
  retailPriceKRW: number
  commentKey: string
}[] = [
  {
    titleKey: 'home.forBuyers.products.diorSet',
    items: [
      { size: '소형', price: 42000, quantity: 1 },
      { size: '소형', price: 38000, quantity: 1 },
      { size: '소형', price: 32000, quantity: 1 }
    ],
    retailPrice: 96,
    retailCurrency: 'GBP',
    retailPriceKRW: 178560,
    commentKey: 'home.forBuyers.products.diorComment'
  },
  {
    titleKey: 'home.forBuyers.products.johnnieWalker',
    items: [{ size: '중형', price: 41000, quantity: 1 }],
    retailPrice: 38,
    retailCurrency: 'GBP',
    retailPriceKRW: 70680,
    commentKey: 'home.forBuyers.products.johnnieComment'
  },
  {
    titleKey: 'home.forBuyers.products.musinsaJacket',
    items: [{ size: '대형', price: 79000, quantity: 1 }],
    retailPrice: 0,
    retailCurrency: '',
    retailPriceKRW: 0,
    commentKey: 'home.forBuyers.products.musinsaComment'
  },
  {
    titleKey: 'home.forBuyers.products.onCloudmonster',
    items: [{ size: '대형', price: 219000, quantity: 1 }],
    retailPrice: 170,
    retailCurrency: 'GBP',
    retailPriceKRW: 316200,
    commentKey: 'home.forBuyers.products.onCloudComment'
  },
  {
    titleKey: 'home.forBuyers.products.marlboro',
    items: [{ size: '소형', price: 32000, quantity: 1 }],
    retailPrice: 163,
    retailCurrency: 'GBP',
    retailPriceKRW: 302580,
    commentKey: 'home.forBuyers.products.marlboroComment'
  }
]

function ForBuyersSection() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <section className="bg-white py-20 px-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          {t('home.forBuyers.title')}
        </h2>
        <p className="text-gray-600 text-base mb-8">
          {t('home.forBuyers.subtitle')}
        </p>

        <div className="flex justify-center mb-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/request/new')} 
                size="lg" 
                className="px-6 py-2 text-base flex items-center justify-center gap-2"
              >
                <PlusCircle size={18} /> {t('home.forBuyers.createRequestButton')}
              </Button>
              <Button 
                onClick={() => navigate('/mypage')} 
                variant="outline" 
                size="lg" 
                className="px-6 py-2 text-base flex items-center justify-center gap-2"
              >
                <Settings size={18} /> {t('home.forBuyers.manageRequestsButton')}
              </Button>
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-center text-blue-800 mb-7">
          {t('home.forBuyers.benefitsTitle')}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {examples.map(({ titleKey, items, retailPrice, retailCurrency, retailPriceKRW, commentKey }) => {
            const suggested = calculateSuggestedReward(items)
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            const saving = retailPriceKRW > 0 ? retailPriceKRW - (total + suggested) : undefined

            return (
              <div key={titleKey} className="border rounded-layout shadow-card p-5 bg-blue-50 space-y-2 text-left hover:shadow-lg transition-all duration-200 hover:border-brand/30">
                <h4 className="text-base font-semibold text-blue-800 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-brand" />
                  {t(titleKey)}
                </h4>
                {retailCurrency && retailPrice > 0 && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span className="font-medium">🇬🇧</span> {t('home.forBuyers.localPrice')}: {retailCurrency} {retailPrice.toFixed(2)} (약 ₩{retailPriceKRW.toLocaleString()})
                  </p>
                )}
                <div className="mt-1 text-sm text-gray-700 space-y-2 border-t border-blue-200 pt-3">
                  <p className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" /> {t('home.forBuyers.koreanPrice')}: ₩{total.toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <PlusCircle size={16} className="text-brand" /> {t('home.forBuyers.estimatedFee')}: ₩{suggested.toLocaleString()}
                  </p>
                </div>
                {saving !== undefined && (
                  <p className="text-sm text-blue-700 font-medium mt-1 flex items-center gap-2">
                    <Percent size={16} /> {t('home.forBuyers.estimatedSavings')}: ₩{saving.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                  <span className="mt-1">💬</span> {t(commentKey)}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-14 bg-blue-100 rounded-layout p-6 border border-blue-300 text-blue-800 text-left shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-brand">
                <Percent size={20} />
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-2">
                {t('home.forBuyers.customsTitle')}
              </h4>
              <p className="text-sm leading-relaxed">
                {t('home.forBuyers.customsDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForBuyersSection