'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  MessageCircle, 
  Calendar, 
  Heart, 
  Apple,
  BookOpen,
  Mic,
  AlertTriangle,
  Bell,
  LayoutDashboard,
  Map,
  FileText,
  Building2,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import { FloatingEmergencyButton } from '@/components/shared/EmergencyBanner'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  labelHindi?: string
}

const userNavItems: NavItem[] = [
  { href: '/user-dashboard', icon: Home, label: 'Home', labelHindi: 'होम' },
  { href: '/period-tracker', icon: Calendar, label: 'Period', labelHindi: 'पीरियड' },
  { href: '/asha-didi', icon: MessageCircle, label: 'Asha Didi', labelHindi: 'आशा दीदी' },
  { href: '/pregnancy', icon: Heart, label: 'Pregnancy', labelHindi: 'गर्भावस्था' },
  { href: '/nutrition', icon: Apple, label: 'Nutrition', labelHindi: 'पोषण' },
]

const ashaWorkerNavItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', labelHindi: 'डैशबोर्ड' },
  { href: '/beneficiaries', icon: Users, label: 'Beneficiaries', labelHindi: 'लाभार्थी' },
  { href: '/voice-log', icon: Mic, label: 'Voice Log', labelHindi: 'वॉइस लॉग' },
  { href: '/alerts', icon: Bell, label: 'Alerts', labelHindi: 'अलर्ट' },
]

const ngoPartnerNavItems: NavItem[] = [
  { href: '/ngo/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ngo/heatmap', icon: Map, label: 'Risk Heatmap' },
  { href: '/ngo/analytics/red-flags', icon: AlertTriangle, label: 'Red Flag Analytics' },
  { href: '/ngo/asha-coverage', icon: Users, label: 'ASHA Coverage' },
  { href: '/ngo/schemes', icon: FileText, label: 'Scheme Management' },
]

export function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-2 flex items-center justify-center animate-spin">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      </div>
    )
  }

  const getNavItems = () => {
    switch (profile?.role) {
      case 'asha_worker':
        return ashaWorkerNavItems
      case 'ngo_partner':
        return ngoPartnerNavItems
      default:
        return userNavItems
    }
  }

  const getTheme = () => {
    switch (profile?.role) {
      case 'asha_worker':
        return {
          gradient: 'from-emerald-50 via-white to-emerald-50',
          headerBorder: 'border-emerald-100',
          headerHover: 'hover:bg-emerald-50',
          iconGradient: 'from-emerald-400 to-emerald-600',
          bottomBorder: 'border-emerald-100'
        }
      case 'ngo_partner':
        return {
          gradient: 'from-slate-50 via-white to-slate-50',
          headerBorder: 'border-slate-200',
          headerHover: 'hover:bg-slate-50',
          iconGradient: 'from-slate-600 to-slate-800',
          bottomBorder: 'border-slate-200'
        }
      default:
        return {
          gradient: 'from-pink-50 via-white to-pink-50',
          headerBorder: 'border-pink-100',
          headerHover: 'hover:bg-pink-50',
          iconGradient: 'from-pink-400 to-pink-600',
          bottomBorder: 'border-pink-100'
        }
    }
  }

  const getBrandName = () => {
    switch (profile?.role) {
      case 'asha_worker':
        return 'ASHA Worker'
      case 'ngo_partner':
        return 'NGO Partner'
      default:
        return 'ASHA AI'
    }
  }

  const getIcon = () => {
    switch (profile?.role) {
      case 'asha_worker':
        return Users
      case 'ngo_partner':
        return Building2
      default:
        return Heart
    }
  }

  const getHomeHref = () => {
    switch (profile?.role) {
      case 'asha_worker':
        return '/dashboard'
      case 'ngo_partner':
        return '/ngo/dashboard'
      default:
        return '/user-dashboard'
    }
  }

  const navItems = getNavItems()
  const theme = getTheme()
  const Icon = getIcon()
  
  return (
    <div className={cn('min-h-screen bg-gradient-to-b pb-24', theme.gradient)}>
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <header className={cn('sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b', theme.headerBorder)}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button - Show if not on main dashboard */}
            {pathname !== getHomeHref() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className={cn('p-2 rounded-full text-gray-600', theme.headerHover)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <Link href={getHomeHref()} className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center', theme.iconGradient)}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800">{getBrandName()}</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/learn"
              className={cn('p-2 rounded-full text-gray-600', theme.headerHover)}
            >
              <BookOpen className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {children}
      </main>

      {/* Floating Emergency Button - Only for users */}
      {profile?.role === 'user' && <FloatingEmergencyButton />}

      {/* Bottom Navigation */}
      <nav className={cn('fixed bottom-0 left-0 right-0 z-50 bg-white border-t safe-area-inset', theme.bottomBorder)}>
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-5 relative">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              // Only apply middle item treatment for user role (Asha Didi)
              const isMiddleItem = profile?.role === 'user' && index === 2
              
              // Get theme colors for active state
              const getActiveColors = () => {
                switch (profile?.role) {
                  case 'asha_worker':
                    return 'text-emerald-600 bg-emerald-50 hover:text-emerald-600 hover:bg-emerald-50'
                  case 'ngo_partner':
                    return 'text-slate-600 bg-slate-50 hover:text-slate-600 hover:bg-slate-50'
                  default:
                    return 'text-pink-600 bg-pink-50 hover:text-pink-600 hover:bg-pink-50'
                }
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors relative',
                    isMiddleItem && 'mb-3 -mt-3', // Elevate middle item slightly up
                    !isMiddleItem && (isActive 
                      ? getActiveColors()
                      : 'text-gray-600 hover:bg-gray-50')
                  )}
                >
                  {isMiddleItem ? (
                    <>
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-1 shadow-lg transition-all',
                        isActive 
                          ? 'bg-gradient-to-br from-pink-400 to-pink-600 scale-105' 
                          : 'bg-gradient-to-br from-pink-300 to-pink-500 hover:scale-105'
                      )}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={cn('font-medium', isActive && 'text-pink-600')}>
                        {item.label}
                      </span>
                      {item.labelHindi && (
                        <span className={cn('text-[10px] font-hindi opacity-75', isActive && 'text-pink-600')}>
                          {item.labelHindi}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <item.icon className={cn('w-5 h-5 mb-1', isActive && getActiveColors().split(' ')[0])} />
                      <span className={cn('font-medium', isActive && getActiveColors().split(' ')[0])}>
                        {item.label}
                      </span>
                      {item.labelHindi && (
                        <span className={cn('text-[10px] font-hindi opacity-75', isActive && getActiveColors().split(' ')[0])}>
                          {item.labelHindi}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default RoleBasedLayout