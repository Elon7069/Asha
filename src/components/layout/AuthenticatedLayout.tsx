'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (loading) return

    // Don't redirect if we're already on profile-setup page or auth pages
    if (pathname === '/profile-setup' || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return
    }

    // Allow access even without a profile - users can complete it later
    // Only redirect to appropriate dashboard if profile exists and user is on wrong route
    if (profile) {
      // Check if user is on correct role-based route
      const isOnCorrectRoute = () => {
        // Allow /learn for all roles
        if (pathname === '/learn' || pathname.startsWith('/learn/')) {
          return true
        }
        
        switch (profile.role) {
          case 'asha_worker':
            return pathname.startsWith('/dashboard') || pathname.startsWith('/alerts') || pathname.startsWith('/beneficiaries') || pathname.startsWith('/voice-log')
          case 'ngo_partner':
            return pathname.startsWith('/ngo/')
          default: // 'user'
            return pathname.startsWith('/user') || pathname.startsWith('/asha-didi') || pathname.startsWith('/period-tracker') || pathname.startsWith('/pregnancy') || pathname.startsWith('/nutrition')
        }
      }

      // Redirect to appropriate dashboard if on wrong route (but not for API routes)
      if (!isOnCorrectRoute() && !pathname.startsWith('/api/')) {
        switch (profile.role) {
          case 'asha_worker':
            router.push('/dashboard')
            break
          case 'ngo_partner':
            router.push('/ngo/dashboard')
            break
          default:
            router.push('/user-dashboard')
        }
      }
    }
    // If no profile, allow access to all pages - they can complete profile later
  }, [user, profile, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Allow rendering even without profile - users can access pages and complete profile later
  return (
    <RoleBasedLayout>
      {children}
    </RoleBasedLayout>
  )
}