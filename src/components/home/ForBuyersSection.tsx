// src/components/home/ForBuyersSection.tsx

import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'

function ForBuyersSection() {
  const navigate = useNavigate()

  return (
    <section className="bg-white py-20 px-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">해외에서 한국 물건, 더 쉽게</h2>
        <p className="text-gray-600 text-base mb-8">
          직구보다 싸고, 빠르고, 덜 귀찮은 방법.  
          한국에서 출발하는 여행자의 짐 공간을 통해  
          원하는 물건을 더 자연스럽게 받아보세요.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => navigate('/request/new')} size="lg">
            배송 요청하기
          </Button>
          <Button onClick={() => navigate('/mypage')} variant="outline" size="lg">
            내 요청 관리
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ForBuyersSection
