import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

// 🔄 Profile 타입 정의
type Profile = {
  id: string
  name: string
  nickname: string
  phone: string
  country_code: string
}

// 🔄 Context 타입 정의
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

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const init = async () => {
      console.log('🔁 [init] 세션 복구 시작')

      const { data: sessionData } = await supabase.auth.getSession()
      let sessionUser = sessionData.session?.user ?? null

      // 🔄 세션 없으면 getUser로 보정 시도
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
        navigate('/profile/setup')
        return
      }

      setProfile(profileData)
      setLoading(false)
    }

    init()

    // 🔄 auth 상태 변화 감지 (로그인/로그아웃 포함)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [onAuthStateChange] 감지됨:', event)
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (!currentUser) {
          console.log('🚪 로그아웃 또는 세션 만료 → 사용자 null')
          setProfile(null)
          setLoading(false)
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        const isIncomplete =
          !profileData?.name || !profileData?.nickname || !profileData?.phone

        if (!profileData || isIncomplete) {
          setProfile(null)
          setLoading(false)
          navigate('/profile/setup')
          return
        }

        setProfile(profileData)
        setLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [navigate])

  const logout = async () => {
    console.log('👋 로그아웃 시도됨')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
