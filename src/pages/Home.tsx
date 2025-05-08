// src/pages/Home.tsx

import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'
import FeatureCards from '../components/home/FeatureCards'
import ForBuyersSection from '../components/home/ForBuyersSection' // ✅ 추가

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <FeatureCards />
      <ForBuyersSection /> {/* ✅ 바이어용 섹션 하단에 삽입 */}
    </div>
  )
}

export default Home
