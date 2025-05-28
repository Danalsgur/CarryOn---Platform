import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { calculateSuggestedReward, Item } from '../../utils/rewardCalculator'
import { memo } from 'react'
import { motion } from 'framer-motion'

const examples: {
  title: string
  items: Item[]
  retailPrice: number
  retailCurrency: string
  retailPriceKRW: number
  comment: string
  icon: string
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
    comment: '런던에서 ₩178,000 상당, 면세점에서 ₩112,000에 구성 가능',
    icon: '💄'
  },
  {
    title: '조니워커 블랙라벨 1L (면세점)',
    items: [{ size: '중형', price: 41000, quantity: 1 }],
    retailPrice: 38,
    retailCurrency: 'GBP',
    retailPriceKRW: 70680,
    comment: '면세점 구매 가능. 런던 마트보다 훨씬 저렴하며 선물용으로 인기',
    icon: '🥃'
  },
  {
    title: '무신사 스탠다드 자켓',
    items: [{ size: '대형', price: 79000, quantity: 1 }],
    retailPrice: 0,
    retailCurrency: '',
    retailPriceKRW: 0,
    comment: '영국 내 구매 불가. 한국에서만 구매 가능 → 배송 자체가 불가능한 브랜드',
    icon: '🧥'
  },
  {
    title: 'On Cloudmonster 2 러닝화',
    items: [{ size: '대형', price: 219000, quantity: 1 }],
    retailPrice: 170,
    retailCurrency: 'GBP',
    retailPriceKRW: 316200,
    comment: '한국 공식가 ₩219,000. 영국에서는 ₩316,000 상당으로 더 비싸고, 한국에서 직구하면 관세 부담도 발생. CarryOn으로 관세 없이 저렴하게 받을 수 있음',
    icon: '👟'
  },
  {
    title: '말보루 골드 담배 1보루 (면세점)',
    items: [{ size: '소형', price: 32000, quantity: 1 }],
    retailPrice: 163,
    retailCurrency: 'GBP',
    retailPriceKRW: 302580,
    comment: '공항 면세점 ₩32,000 vs 런던 ₩302,000 상당. (세관 규정 내 허용 수량만 가능)',
    icon: '🚬'
  }
]

const ForBuyersSection = memo(function ForBuyersSection() {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section 
      className="bg-white py-20 px-4 border-t border-gray-200"
      role="region"
      aria-label="바이어를 위한 정보"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-2xl font-bold text-blue-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          한국 물건, 더 싸고 자유롭게
        </motion.h2>
        <motion.p 
          className="text-gray-600 text-base mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          직구보다 더 저렴하게. 원하는 물건을 원하는 방식으로.<br />
          캐리어의 여유 공간을 통해, 제한 없이 유연하게 받아보세요.
        </motion.p>

        <motion.div 
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/request/new')} 
                size="lg" 
                className="px-6 py-2 text-base hover:scale-105 transition-transform"
                aria-label="배송 요청하기"
              >
                배송 요청하기
              </Button>
              <Button 
                onClick={() => navigate('/mypage')} 
                variant="outline" 
                size="lg" 
                className="px-6 py-2 text-base hover:scale-105 transition-transform"
                aria-label="내 요청 관리"
              >
                내 요청 관리
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.h3 
          className="text-xl sm:text-2xl font-bold text-center text-blue-800 mb-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          이런 경우, CarryOn이 훨씬 이득입니다
        </motion.h3>

        <motion.div 
          className="grid sm:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {examples.map(({ title, items, retailPrice, retailCurrency, retailPriceKRW, comment, icon }) => {
            const suggested = calculateSuggestedReward(items)
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            const saving = retailPriceKRW > 0 ? retailPriceKRW - (total + suggested) : undefined

            return (
              <motion.div 
                key={title} 
                variants={itemVariants}
                className="border rounded-lg shadow-sm p-4 bg-blue-50 space-y-1 text-left hover:shadow-md transition-all duration-300"
                role="article"
                aria-label={`${title} 가격 비교`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <h4 className="text-base font-semibold text-blue-800">{title}</h4>
                </div>
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
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div 
          className="mt-14 bg-blue-100 rounded-xl p-5 border border-blue-300 text-blue-800 text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          role="complementary"
          aria-label="관세 정보"
        >
          <h4 className="text-base font-semibold mb-2">관세 부담이 적은 이유</h4>
          <p className="text-sm leading-relaxed">
            CarryOn은 개인 간의 1회성 위탁 배송 형식으로, 대부분 관세 없이 통과됩니다.<br />
            캐리어가 직접 물건을 들고 전달하고, 소량·비상업성 구조라 세관에서 간소하게 처리되는 경우가 많습니다.
          </p>
        </motion.div>
      </div>
    </section>
  )
})

export default ForBuyersSection