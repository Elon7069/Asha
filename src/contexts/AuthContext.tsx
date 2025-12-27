'use client'

import * as React from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

type UserRole = 'user' | 'asha_worker' | 'ngo_partner'

interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  full_name: string | null
  display_name: string | null
  profile_photo_url: string | null
  age: number | null
  preferred_language: string
  phone_number: string | null
  email: string | null
  // Add other profile fields as needed
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  const supabase = getSupabaseClient()

  // Fetch user profile from database
  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      // First, get the asha_users record by auth_id
      const { data: ashaUser, error: userError } = await supabase
        .from('asha_users')
        .select(`
          id,
          auth_id,
          full_name,
          display_name,
          profile_photo_url,
          age,
          preferred_language,
          phone_number,
          role
        `)
        .eq('auth_id', userId)
        .maybeSingle()

      if (!ashaUser || userError) {
        console.log('No asha_users record found for auth_id:', userId)
        return null
      }

      // Check asha_user_profiles (for regular users)
      if (ashaUser.role === 'user') {
        const { data: userProfile, error: profileError } = await supabase
          .from('asha_user_profiles')
          .select('id')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (userProfile && !profileError) {
          return {
            id: ashaUser.id,
            user_id: ashaUser.id,
            role: 'user' as UserRole,
            full_name: ashaUser.full_name,
            display_name: ashaUser.display_name,
            profile_photo_url: ashaUser.profile_photo_url,
            age: ashaUser.age,
            preferred_language: ashaUser.preferred_language || 'hi',
            phone_number: ashaUser.phone_number,
            email: null // Email is in auth.users, not in asha_users
          } as UserProfile
        }
      }

      // Check asha_worker_profiles
      if (ashaUser.role === 'asha_worker') {
        const { data: ashaData, error: ashaError } = await supabase
          .from('asha_worker_profiles')
          .select('id')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (ashaData && !ashaError) {
          return {
            id: ashaUser.id,
            user_id: ashaUser.id,
            role: 'asha_worker' as UserRole,
            full_name: ashaUser.full_name,
            display_name: ashaUser.display_name,
            profile_photo_url: ashaUser.profile_photo_url,
            age: ashaUser.age,
            preferred_language: ashaUser.preferred_language || 'hi',
            phone_number: ashaUser.phone_number,
            email: null
          } as UserProfile
        }
      }

      // Check ngo_partner_profiles
      if (ashaUser.role === 'ngo_partner') {
        const { data: ngoData, error: ngoError } = await supabase
          .from('ngo_partner_profiles')
          .select('id, email')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (ngoData && !ngoError) {
          return {
            id: ashaUser.id,
            user_id: ashaUser.id,
            role: 'ngo_partner' as UserRole,
            full_name: ashaUser.full_name,
            display_name: ashaUser.display_name,
            profile_photo_url: ashaUser.profile_photo_url,
            age: ashaUser.age,
            preferred_language: ashaUser.preferred_language || 'hi',
            phone_number: ashaUser.phone_number,
            email: ngoData.email
          } as UserProfile
        }
      }

      console.log('No profile found in any table for user:', userId)
      return null
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  }, [supabase])

  // Refresh profile data
  const refreshProfile = React.useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user?.id, fetchProfile])

  // Sign out function
  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [supabase, router])

  // Listen for auth state changes
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch or create user profile
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  // Get initial session
  React.useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      }
      setLoading(false)
    }

    getInitialSession()
  }, [supabase, fetchProfile])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook to redirect based on user role
export function useRoleRedirect() {
  const { profile, user } = useAuth()
  const router = useRouter()

  const redirectToDashboard = React.useCallback(() => {
    // If user exists but no profile, redirect to register to complete profile
    if (user && !profile) {
      router.push('/register')
      return
    }

    if (!profile) return

    switch (profile.role) {
      case 'asha_worker':
        router.push('/dashboard')
        break
      case 'ngo_partner':
        router.push('/ngo-dashboard')
        break
      case 'user':
        router.push('/user-dashboard')
        break
      default:
        router.push('/user-dashboard')
    }
  }, [profile, user, router])

  return { redirectToDashboard }
}