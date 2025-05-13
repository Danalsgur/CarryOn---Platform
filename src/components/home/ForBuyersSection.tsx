import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { calculateSuggestedReward, Item } from '../../utils/rewardCalculator'

const examples: {
  title: string
  items: Item[]
  retailPrice: number
  retailCurrency: string
  retailPriceKRW: number
  comment: string
}[] = [
  {
    title: '면세점 Dior 화장품 세트 (립밤, 아이크림, 핸드크림)',
    items: [
      { size: '소형', price: 42000, quantity: 1 },
      { size: '소형', price: 38000, quantity: 1 },
      { size: '소형', price: 32000, quantity: 1 }
    ],
    retailPrice: 96,
    retailCurrency: 'GBP',
    retailPriceKRW: 178560,
    comment: '런던에서 ₩178,000 상당, 면세점에서 ₩112,000에 구성 가능'
  },
  {
    title: '조니워커 블랙라벨 1L (면세점)',
    items: [{ size: '중형', price: 41000, quantity: 1 }],
    retailPrice: 38,
    retailCurrency: 'GBP',
    retailPriceKRW: 70680,
    comment: '면세점 구매 가능. 런던 마트보다 훨씬 저렴하며 선물용으로 인기'
  },
  {
    title: '무신사 스탠다드 자켓',
    items: [{ size: '대형', price: 79000, quantity: 1 }],
    retailPrice: 0,
    retailCurrency: '',
    retailPriceKRW: 0,
    comment: '영국 내 구매 불가. 한국에서만 구매 가능 → 배송 자체가 불가능한 브랜드'
  },
  {
    title: 'On Cloudmonster 2 러닝화',
    items: [{ size: '대형', price: 219000, quantity: 1 }],
    retailPrice: 170,
    retailCurrency: 'GBP',
    retailPriceKRW: 316200,
    comment: '한국 공식가 ₩219,000. 영국에서는 ₩316,000 상당으로 더 비싸고, 한국에서 직구하면 관세 부담도 발생. CarryOn으로 관세 없이 저렴하게 받을 수 있음'
  },
  {
    title: '말보루 골드 담배 1보루 (면세점)',
    items: [{ size: '소형', price: 32000, quantity: 1 }],
    retailPrice: 163,
    retailCurrency: 'GBP',
    retailPriceKRW: 302580,
    comment: '공항 면세점 ₩32,000 vs 런던 ₩302,000 상당. (세관 규정 내 허용 수량만 가능)'
  }
]

function ForBuyersSection() {
  const navigate = useNavigate()

  return (
    <section className="bg-white py-20 px-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">한국 물건, 더 싸고 자유롭게</h2>
        <p className="text-gray-600 text-base mb-8">
          직구보다 더 저렴하게. 원하는 물건을 원하는 방식으로.<br />
          캐리어의 여유 공간을 통해, 제한 없이 유연하게 받아보세요.
        </p>

        <div className="flex justify-center mb-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/request/new')} size="lg" className="px-6 py-2 text-base">
                배송 요청하기
              </Button>
              <Button onClick={() => navigate('/mypage')} variant="outline" size="lg" className="px-6 py-2 text-base">
                내 요청 관리
              </Button>
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-center text-blue-800 mb-7">
          이런 경우, CarryOn이 훨씬 이득입니다
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {examples.map(({ title, items, retailPrice, retailCurrency, retailPriceKRW, comment }) => {
            const suggested = calculateSuggestedReward(items)
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            const saving = retailPriceKRW > 0 ? retailPriceKRW - (total + suggested) : undefined

            return (
              <div key={title} className="border rounded-lg shadow-sm p-4 bg-blue-50 space-y-1 text-left">
                <h4 className="text-base font-semibold text-blue-800">{title}</h4>
                {retailCurrency && retailPrice > 0 && (
                  <p className="text-sm text-gray-600">
                    🇬🇧 현지 시세: {retailCurrency} {retailPrice.toFixed(2)} (약 ₩{retailPriceKRW.toLocaleString()})
                  </p>
                )}
                <div className="mt-1 text-sm text-gray-700 space-y-0.5 border-t border-blue-200 pt-2">
                  <p>💰 한국 가격: ₩{total.toLocaleString()}</p>
                  <p>📦 예상 수고비: ₩{suggested.toLocaleString()}</p>
                </div>
                {saving !== undefined && (
                  <p className="text-sm text-blue-700 font-medium mt-1">
                    → 예상 절감: ₩{saving.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">💬 {comment}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-14 bg-blue-100 rounded-xl p-5 border border-blue-300 text-blue-800 text-left">
          <h4 className="text-base font-semibold mb-2">관세 부담이 적은 이유</h4>
          <p className="text-sm leading-relaxed">
            CarryOn은 개인 간의 1회성 위탁 배송 형식으로, 대부분 관세 없이 통과됩니다.<br />
            캐리어가 직접 물건을 들고 전달하고, 소량·비상업성 구조라 세관에서 간소하게 처리되는 경우가 많습니다.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ForBuyersSection