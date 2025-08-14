import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { supabase } from '../supabase'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

type Profile = {
  id: string
  name: string
  nickname: string
  phone: string
  country_code: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
  setProfile: (p: Profile | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const hasRun = useRef(false)

  // ✅ init 함수 외부로 분리 (재사용 가능)
  const init = useCallback(async () => {
    console.log('🔁 [init] 세션 복구 시작')

    const { data: sessionData } = await supabase.auth.getSession()
    let sessionUser = sessionData.session?.user ?? null

    if (!sessionUser && sessionData.session) {
      const { data: userData, error } = await supabase.auth.getUser()
      if (error) console.error('🛠 getUser error:', error)
      sessionUser = userData.user
    }

    setUser(sessionUser)

    if (!sessionUser) {
      console.log('🚫 세션 없음 → 비로그인 사용자')
      setProfile(null)
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle()

    const isIncomplete =
      !profileData?.name || !profileData?.nickname || !profileData?.phone

    if (!profileData || isIncomplete) {
      setProfile(null)
      setLoading(false)
      setTimeout(() => {
        navigate('/profile/setup')
      }, 0)
      return
    }

    setProfile(profileData)
    setLoading(false)
  }, [navigate])

  // ✅ 마운트 시 init 실행 + onAuthStateChange 등록
  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log('🔄 [onAuthStateChange] 감지됨:', event)
        init()
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [init])

  // ✅ 탭 복귀 시에도 세션/프로필 재확인
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️‍🗨️ 탭 복귀 → 세션 재확인')
        init()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [init])

  const logout = async () => {
    try {
      console.log('👋 로그아웃 시도')
      // 1) Supabase 세션 종료 (완료될 때까지 대기)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ supabase.auth.signOut 오류:', error)
      } else {
        console.log('✅ supabase.auth.signOut 완료')
      }

      // 2) 로컬 상태 정리
      setUser(null)
      setProfile(null)

      // 3) 로컬 스토리지에서 Supabase 관련 토큰 제거 (모바일 사파리 대응)
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i) || ''
          if (key.startsWith('sb-') || key.toLowerCase().includes('supabase')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((k) => {
          console.log('🗑️ localStorage 제거:', k)
          localStorage.removeItem(k)
        })
      } catch (lsErr) {
        console.warn('⚠️ localStorage 정리 중 문제:', lsErr)
      }

      // 4) 하드 리다이렉트 (replace로 히스토리 대체)
      console.log('🌐 하드 리다이렉트 실행')
      window.location.replace('/')
    } catch (err) {
      console.error('❌ 로그아웃 처리 중 예외:', err)
      window.location.replace('/')
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logout, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
