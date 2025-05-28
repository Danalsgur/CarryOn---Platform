import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { supabase } from '../supabase'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/utils/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { User as FirebaseUser } from 'firebase/auth'

interface Profile {
  nickname: string
  phoneNumber: string
  role: 'buyer' | 'carrier' | 'both'
}

interface AuthContextType {
  user: FirebaseUser | null
  profile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profile: Partial<Profile>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
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

    setUser(sessionUser as unknown as FirebaseUser | null)

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

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    const profileDoc = await getDoc(doc(db, 'users', user.uid))
    if (!profileDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString()
      })
    }
  }

  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    const profileDoc = await getDoc(doc(db, 'users', user.uid))
    if (!profileDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString()
      })
    }
  }

  const signup = async (email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      createdAt: new Date().toISOString()
    })
  }

  const logout = async () => {
    console.log('👋 로그아웃 시도됨')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    console.log('🌐 브라우저 이동 시도함')
    window.location.href = '/'
  }

  const updateProfile = async (newProfile: Partial<Profile>) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true })
    setProfile(prev => prev ? { ...prev, ...newProfile } : null)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithGoogle,
        loginWithGithub,
        signup,
        logout,
        updateProfile,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
