'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Heart } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login')
        return
      }

      if (!profile) {
        // User authenticated but no profile, redirect to register
        router.push('/register')
        return
      }

      // Redirect to appropriate profile page based on role
      switch (profile.role) {
        case 'asha_worker':
          router.push('/asha-profile')
          break
        case 'ngo_partner':
          router.push('/ngo-profile')
          break
        case 'user':
        default:
          router.push('/user-profile')
          break
      }
    }
  }, [user, profile, loading, router])

  // Show loading state while determining where to redirect
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
          <p className="text-pink-600">Loading profile...</p>
        </div>
      </div>
    </div>
  )
}