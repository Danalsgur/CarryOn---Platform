// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 초기 세션 복구 및 프로필 fetch
  useEffect(() => {
    const init = async () => {
      console.log('🔁 [init] 세션 복구 시작')
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData.session?.user ?? null
      setUser(sessionUser)

      if (sessionUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle()

        setProfile(profileData ?? null)
      }

      setLoading(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [onAuthStateChange] 감지됨:', event)
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          console.log('👤 [listener] 유저:', currentUser)
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle()

          setProfile(profileData ?? null)

          if (!profileData) {
            navigate('/profile/setup')
          }
        } else {
          setProfile(null)
        }
      }
    )

    init()

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
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
