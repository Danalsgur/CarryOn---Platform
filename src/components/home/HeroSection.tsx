// src/components/home/HeroSection.tsx

import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'

function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center bg-blue-50 px-4 py-16">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">
        ✈️ CarryOn – 여행의 짐 공간을 나누세요
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        여행 중 남는 캐리어 공간으로 다른 사람의 물건을 대신 배송해주고, 보상을 받아보세요.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate('/trip/new')} size="lg">
          여정 등록하기
        </Button>
        <Button onClick={() => navigate('/requests')} variant="outline" size="lg">
          요청 찾아보기
        </Button>
      </div>
    </section>
  )
}

export default HeroSection
