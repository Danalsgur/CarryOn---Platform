// src/pages/Home.tsx

import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'
import ForBuyersSection from '../components/home/ForBuyersSection'

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <ForBuyersSection />
    </div>
  )
}

export default Home
