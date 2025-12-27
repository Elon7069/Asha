'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  ArrowRight,
  Users,
  Building2,
  ArrowLeft,
  Baby,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type UserRole = 'user' | 'asha_worker' | 'ngo_partner'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPregnancyDialog, setShowPregnancyDialog] = React.useState(false)
  const [isPregnant, setIsPregnant] = React.useState<boolean | null>(null)

  const handleUserRoleClick = () => {
    // Show pregnancy dialog when user clicks "user"
    setShowPregnancyDialog(true)
  }

  const handlePregnancySelection = (pregnant: boolean) => {
    setIsPregnant(pregnant)
    setShowPregnancyDialog(false)
    // Now proceed with role selection
    handleRoleSelect('user', pregnant)
  }

  const handleRoleSelect = (role: UserRole, pregnant: boolean | null = null) => {
    setIsLoading(true)
    
    // Save the role to localStorage
    localStorage.setItem('asha_user_role', role)
    
    // Create minimal profile entry with the role and pregnancy status
    const initialProfile = {
      role: role,
      id: `temp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(role === 'user' && pregnant !== null ? { isPregnant: pregnant } : {}),
    }
    localStorage.setItem('asha_user_profile', JSON.stringify(initialProfile))
    
    // Trigger event to update AuthContext
    window.dispatchEvent(new CustomEvent('profile-updated'))
    
    // Redirect to appropriate dashboard based on role
    setTimeout(() => {
      switch (role) {
        case 'asha_worker':
          window.location.href = '/dashboard'
          break
        case 'ngo_partner':
          window.location.href = '/ngo/dashboard'
          break
        case 'user':
        default:
          window.location.href = '/user-dashboard'
          break
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button - Always goes to landing page */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Always navigate to landing page, replacing current history entry
            router.replace('/')
          }}
          className="bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-3 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Select Your Role
          </h1>
          <p className="text-base text-pink-600 font-hindi">
            अपनी भूमिका चुनें
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-pink-200 shadow-xl border backdrop-blur-sm bg-white/95">
            <CardHeader>
              <CardTitle className="text-center">
                Who are you? / आप कौन हैं?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="button"
                    onClick={handleUserRoleClick}
                    disabled={isLoading}
                    className="h-auto p-5 w-full flex items-center gap-4 border-2 border-pink-200 hover:border-pink-400 bg-gradient-to-r from-pink-50 to-pink-100/30 hover:from-pink-100 hover:to-pink-200/50 shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-base text-gray-900 mb-0.5">User / उपयोगकर्ता</div>
                      <div className="text-xs text-gray-600 font-hindi line-clamp-1">मैं स्वास्थ्य सेवाएं चाहती हूं</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="button"
                    onClick={() => handleRoleSelect('asha_worker')}
                    disabled={isLoading}
                    className="h-auto p-5 w-full flex items-center gap-4 border-2 border-emerald-200 hover:border-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100/30 hover:from-emerald-100 hover:to-emerald-200/50 shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-base text-gray-900 mb-0.5">ASHA Worker / आशा कार्यकर्ता</div>
                      <div className="text-xs text-gray-600 font-hindi line-clamp-1">मैं एक आशा कार्यकर्ता हूं</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="button"
                    onClick={() => handleRoleSelect('ngo_partner')}
                    disabled={isLoading}
                    className="h-auto p-5 w-full flex items-center gap-4 border-2 border-indigo-200 hover:border-indigo-400 bg-gradient-to-r from-indigo-50 to-indigo-100/30 hover:from-indigo-100 hover:to-indigo-200/50 shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-base text-gray-900 mb-0.5">NGO Partner / NGO साथी</div>
                      <div className="text-xs text-gray-600 font-hindi line-clamp-1">मैं एक NGO साथी हूं</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pregnancy Status Dialog */}
      <Dialog open={showPregnancyDialog} onOpenChange={setShowPregnancyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Are you pregnant? / क्या आप गर्भवती हैं?
            </DialogTitle>
            <DialogDescription className="text-center">
              This helps us provide you with the right care / यह हमें आपको सही देखभाल प्रदान करने में मदद करता है
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePregnancySelection(true)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all hover:scale-105',
                  isPregnant === true
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-pink-200 hover:border-pink-300 bg-white'
                )}
              >
                <span className="text-3xl block mb-2">🤰</span>
                <span className="font-medium text-gray-900">Yes / हां</span>
              </button>
              <button
                type="button"
                onClick={() => handlePregnancySelection(false)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all hover:scale-105',
                  isPregnant === false
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-pink-200 hover:border-pink-300 bg-white'
                )}
              >
                <span className="text-3xl block mb-2">👩</span>
                <span className="font-medium text-gray-900">No / नहीं</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
