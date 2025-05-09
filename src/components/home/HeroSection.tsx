import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { useEffect, useState } from 'react'
import { Typewriter } from 'react-simple-typewriter'
import { motion, AnimatePresence } from 'framer-motion'

function HeroSection() {
  const navigate = useNavigate()
  const [showSecondLine, setShowSecondLine] = useState(false)
  const [slideComplete, setSlideComplete] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowSecondLine(true)
    }, 1000)

    const timer2 = setTimeout(() => {
      setSlideComplete(true)
    }, 2500)

    const timer3 = setTimeout(() => {
      setShowButtons(true)
    }, 3200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center bg-white px-4 py-24 overflow-hidden">
      {/* 문구 영역 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 transition-transform duration-700 ease-in-out z-10"
        style={{ transform: slideComplete ? 'translate(-50%, -200px)' : 'translate(-50%, -50%)' }}
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 leading-tight mb-5">
          <Typewriter
            words={['CarryOn']}
            loop={1}
            cursor={false}
            typeSpeed={120}
          />
        </h1>
        <p className="text-xl sm:text-2xl text-blue-700 mb-2">
          {showSecondLine && (
            <Typewriter
              words={["여유 공간으로 이어지는 사람들"]}
              loop={1}
              cursor={false}
              typeSpeed={80}
            />
          )}
        </p>
      </div>

      {/* 버튼 영역 */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-0 mt-52 flex flex-col items-center gap-6"
          >
            <div className="text-center">
              <p className="text-blue-800 font-semibold text-base mb-2">
                여행 준비 중이신가요?
              </p>
              <p className="text-base text-gray-700">
                CarryOn에 여정을 등록하고 <span className="text-blue-600 font-semibold">캐리어</span>로 활동해보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/trip/new')} size="lg">
                여정 등록하기
              </Button>
              <Button onClick={() => navigate('/requests')} variant="outline" size="lg">
                요청 찾아보기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default HeroSection
