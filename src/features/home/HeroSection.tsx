import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { useEffect, useState, memo } from 'react'
import { Typewriter } from 'react-simple-typewriter'
import { motion, AnimatePresence } from 'framer-motion'

const HeroSection = memo(function HeroSection() {
  const navigate = useNavigate()
  const [showSecondLine, setShowSecondLine] = useState(false)
  const [slideComplete, setSlideComplete] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowSecondLine(true), 1000),
      setTimeout(() => setSlideComplete(true), 1300),
      setTimeout(() => setShowButtons(true), 2000)
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section 
      className="relative min-h-[73vh] bg-white px-4 pt-25 pb-0 overflow-hidden"
      role="banner"
      aria-label="메인 히어로 섹션"
    >
      {/* 문구 영역 */}
      <motion.div
        initial={{ y: '-50%', x: '-50%' }}
        animate={{ y: slideComplete ? '-250px' : '-50%', x: '-50%' }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
        className="absolute top-[67%] left-1/2 text-center z-10"
        aria-live="polite"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 leading-tight mb-3">
          <Typewriter
            words={['CarryOn']}
            loop={1}
            cursor={false}
            typeSpeed={80}
            aria-label="CarryOn"
          />
        </h1>
        <p className="text-base sm:text-lg text-blue-700">
          {showSecondLine && (
            <Typewriter
              words={['여유 공간으로 이어지는 사람들']}
              loop={1}
              cursor={false}
              typeSpeed={40}
              aria-label="여유 공간으로 이어지는 사람들"
            />
          )}
        </p>
      </motion.div>

      {/* 버튼 영역 */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute top-[54%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-center z-0"
            role="group"
            aria-label="주요 액션 버튼"
          >
            <div>
              <p className="text-blue-800 font-semibold text-base mb-1">
                여행 준비 중이신가요?
              </p>
              <p className="text-base text-gray-700">
                CarryOn에 여정을 등록하고{' '}
                <span className="text-blue-600 font-semibold">캐리어</span>로 활동해보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/trip/new')} 
                size="lg"
                aria-label="여정 등록하기"
                className="hover:scale-105 transition-transform"
              >
                여정 등록하기
              </Button>
              <Button 
                onClick={() => navigate('/requests')} 
                variant="outline" 
                size="lg"
                aria-label="요청 찾아보기"
                className="hover:scale-105 transition-transform"
              >
                요청 찾아보기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
})

export default HeroSection
