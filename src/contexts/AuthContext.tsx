'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

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
  [key: string]: any // Allow additional fields from localStorage
}

interface AuthContextType {
  user: { id: string } | null
  session: { user: { id: string } } | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<{ id: string } | null>(null)
  const [session, setSession] = React.useState<{ user: { id: string } } | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  // Load profile from localStorage (bypassing auth)
  const loadProfile = React.useCallback(() => {
    try {
      const storedProfile = localStorage.getItem('asha_user_profile')
      const storedRole = localStorage.getItem('asha_user_role')

      if (storedProfile && storedRole) {
        const profileData = JSON.parse(storedProfile)
        
        // Create user and session objects
        const userId = profileData.id || `user_${Date.now()}`
        const userObj = { id: userId }
        const sessionObj = { user: userObj }

        // Map profile data to UserProfile interface
        const mappedProfile: UserProfile = {
          id: profileData.id || userId,
          user_id: profileData.id || userId,
          role: (profileData.role || storedRole) as UserRole,
          full_name: profileData.name || null,
          display_name: profileData.name || null,
          profile_photo_url: null,
          age: profileData.age ? parseInt(profileData.age) : null,
          preferred_language: 'hi',
          phone_number: profileData.phone || null,
          email: null,
          ...profileData // Include all other fields
        }

        setUser(userObj)
        setSession(sessionObj)
        setProfile(mappedProfile)
        return mappedProfile
      } else {
        setUser(null)
        setSession(null)
        setProfile(null)
        return null
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error)
      setUser(null)
      setSession(null)
      setProfile(null)
      return null
    }
  }, [])

  // Refresh profile data
  const refreshProfile = React.useCallback(() => {
    loadProfile()
  }, [loadProfile])

  // Sign out function
  const signOut = React.useCallback(async () => {
    try {
      localStorage.removeItem('asha_user_profile')
      localStorage.removeItem('asha_user_role')
      setUser(null)
      setSession(null)
      setProfile(null)
      router.push('/profile-setup')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [router])

  // Initialize auth state from localStorage
  React.useEffect(() => {
    // Load profile immediately
    loadProfile()
    setLoading(false)

    // Listen for storage changes (in case profile is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'asha_user_profile' || e.key === 'asha_user_role') {
        loadProfile()
      }
    }

    // Listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      loadProfile()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profile-updated', handleCustomStorageChange)

    // Also check periodically (for same-tab updates)
    const interval = setInterval(() => {
      loadProfile()
    }, 500) // Check more frequently

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profile-updated', handleCustomStorageChange)
      clearInterval(interval)
    }
  }, [loadProfile])

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
    // If user exists but no profile, redirect to profile setup
    if (user && !profile) {
      router.push('/profile-setup')
      return
    }

    if (!profile) {
      router.push('/profile-setup')
      return
    }

    switch (profile.role) {
      case 'asha_worker':
        router.push('/dashboard')
        break
      case 'ngo_partner':
        router.push('/ngo/dashboard')
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