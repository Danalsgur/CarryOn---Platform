// src/components/home/FeatureCards.tsx

import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'

function FeatureCards() {
  const navigate = useNavigate()

  const features = [
    {
      title: '내 여정 관리',
      description: '등록한 여정과 매칭 현황을 확인하고 관리하세요.',
      buttonText: '여정 보기',
      link: '/mypage',
    },
    {
      title: '요청 리스트',
      description: '다른 사람들이 등록한 요청을 보고 매칭할 수 있어요.',
      buttonText: '요청 둘러보기',
      link: '/requests',
    },
  ]

  return (
    <section className="bg-gray-50 py-16 px-4">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-10">
        주요 기능을 확인하세요
      </h2>

      <div className="max-w-4xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
            </div>
            <Button onClick={() => navigate(feature.link)} className="mt-auto">
              {feature.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeatureCards
