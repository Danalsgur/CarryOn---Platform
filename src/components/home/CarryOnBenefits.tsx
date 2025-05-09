// src/components/home/CarryOnBenefits.tsx

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

export default function CarryOnBenefits() {
  return (
    <section className="bg-white py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-8">
        이런 경우, CarryOn이 훨씬 이득입니다
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {examples.map(({ title, items, retailPrice, retailCurrency, retailPriceKRW, comment }) => {
          const suggested = calculateSuggestedReward(items)
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
          const saving = retailPriceKRW > 0 ? retailPriceKRW - (total + suggested) : undefined

          return (
            <div key={title} className="border rounded-lg shadow-sm p-4 bg-blue-50 space-y-1">
              <h3 className="text-base font-semibold text-blue-800">{title}</h3>
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

      <div className="mt-14 bg-blue-100 rounded-xl p-5 border border-blue-300 text-blue-800">
        <h3 className="text-base font-semibold mb-2">관세 부담이 적은 이유</h3>
        <p className="text-sm leading-relaxed">
          CarryOn은 개인 간의 1회성 위탁 배송 형식으로, 대부분 관세 없이 통과됩니다.<br />
          캐리어가 직접 물건을 들고 전달하고, 소량·비상업성 구조라 세관에서 간소하게 처리되는 경우가 많습니다.
        </p>
      </div>
    </section>
  )
}
