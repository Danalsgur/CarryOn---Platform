import { memo } from 'react'
import { motion } from 'framer-motion'

const steps = [
  {
    step: 'STEP 1',
    title: '여정을 등록해요',
    description: '언제, 어디로 가는지 여행 일정을 입력하고, 남는 짐 공간을 공유할 준비를 합니다.',
    icon: '✈️'
  },
  {
    step: 'STEP 2',
    title: '요청을 살펴보고 골라요',
    description: '내 여정과 맞는 배송 요청을 확인하고, 맡고 싶은 요청을 직접 선택합니다.',
    icon: '🔍'
  },
  {
    step: 'STEP 3',
    title: '바이어와 소통해요',
    description: '오픈채팅을 통해 바이어와 물건 내용, 전달 방식 등을 협의합니다.',
    icon: '💬'
  },
  {
    step: 'STEP 4',
    title: '물건을 준비해요',
    description: '직접 구매하거나, 바이어가 보내준 물건을 받아 전달 준비를 마칩니다.',
    icon: '📦'
  },
  {
    step: 'STEP 5',
    title: '전달하고 수고비를 받아요',
    description: '공항이나 현지에서 바이어에게 물건을 전달하고, 정해진 수고비를 받아요.',
    icon: '💰'
  },
]

const HowItWorks = memo(function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
      className="bg-white py-20 px-4"
      role="region"
      aria-label="서비스 이용 방법"
    >
      <motion.h2 
        className="text-xl sm:text-2xl font-bold text-center text-blue-800 mb-7"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        CarryOn은 이렇게 작동해요
      </motion.h2>

      <motion.div 
        className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-blue-50 rounded-xl p-6 text-center shadow hover:shadow-md transition-all duration-300 hover:scale-105"
            role="article"
            aria-label={`${step.step}: ${step.title}`}
          >
            <div className="text-3xl mb-3">{step.icon}</div>
            <div className="text-sm font-semibold text-blue-500">{step.step}</div>
            <h3 className="text-lg font-bold text-blue-700 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 사용자 역할 설명 섹션 */}
      <motion.div 
        className="mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl sm:text-2xl font-bold text-center text-blue-800 mb-6">
          누가 어떤 역할을 하나요?
        </h3>
        <p className="text-center text-gray-700 text-base max-w-xl mx-auto mb-5">
          CarryOn에서는 <span className="font-medium text-blue-700">바이어</span>와
          <span className="font-medium text-blue-700"> 캐리어</span>가 각자의 방식으로 협력합니다.
        </p>

        <motion.div 
          className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            variants={itemVariants}
            className="bg-blue-50 p-6 rounded-xl shadow space-y-3 border border-blue-100 hover:shadow-lg transition-all duration-300"
            role="article"
            aria-label="바이어 역할 설명"
          >
            <h4 className="text-lg font-semibold text-blue-700">🛍️ 바이어 (Buyer)</h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                받고 싶은 물건을 요청하고, 수고비를 제시해요
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                캐리어와 오픈채팅으로 소통하고 매칭을 확정해요
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                공항이나 현지에서 물건을 전달받아요
              </li>
            </ul>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="bg-blue-50 p-6 rounded-xl shadow space-y-3 border border-blue-100 hover:shadow-lg transition-all duration-300"
            role="article"
            aria-label="캐리어 역할 설명"
          >
            <h4 className="text-lg font-semibold text-blue-700">✈️ 캐리어 (Carrier)</h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                본인의 여행 일정을 등록해요
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                요청 목록에서 원하는 요청을 골라 매칭해요
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                바이어와 소통하고, 전달 후 수고비를 받아요
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
})

export default HowItWorks
