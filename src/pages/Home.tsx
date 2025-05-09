// src/pages/Home.tsx

import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'
import CarryOnBenefits from '../components/home/CarryOnBenefits'
import ForBuyersSection from '../components/home/ForBuyersSection'

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <CarryOnBenefits />
      <ForBuyersSection />
    </div>
  )
}

export default Home
