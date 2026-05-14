'use client'
// ============================================================
// AuthProvider — makes current user + role available everywhere
// via the useAuth() hook in Client Components.
// ============================================================
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { type User } from '@supabase/supabase-js'
import { type Profile, type UserRole } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  isAdmin: boolean
  isLoading: boolean
  isConfigured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  signOut: async () => {},
})

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    !!url &&
    url !== 'your_supabase_project_url' &&
    url.startsWith('http') &&
    !!key &&
    key !== 'your_supabase_anon_key'
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const configured = isSupabaseConfigured()

  const fetchProfile = useCallback(async (userId: string) => {
    if (!configured) return
    // Dynamically import to avoid crashing when env vars are missing
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data as Profile)
  }, [configured])

  useEffect(() => {
    if (!configured) {
      setIsLoading(false)
      return
    }

    let subscription: { unsubscribe: () => void } | null = null

    ;(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get initial session
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      setUser(initialUser)
      if (initialUser) {
        await fetchProfile(initialUser.id)
      }
      setIsLoading(false)

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      })
      subscription = data.subscription
    })()

    return () => {
      subscription?.unsubscribe()
    }
  }, [configured, fetchProfile])

  const signOut = useCallback(async () => {
    if (!configured) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [configured])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        isAdmin: profile?.role === 'admin',
        isLoading,
        isConfigured: configured,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
