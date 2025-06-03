// src/pages/Home.tsx

import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'
import ForBuyersSection from '../components/home/ForBuyersSection'

function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-16">
        <HowItWorks />
        <ForBuyersSection />
      </div>
    </div>
  )
}

export default Home
