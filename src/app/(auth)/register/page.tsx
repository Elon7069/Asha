'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  Calendar,
  Mail,
  Lock,
  Building2,
  BadgeCheck,
  Phone,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth, useRoleRedirect } from '@/contexts/AuthContext'

type UserRole = 'user' | 'asha_worker' | 'ngo_partner'

// Different steps based on role
const getSteps = (role: UserRole) => {
  switch (role) {
    case 'asha_worker':
      return [
        { id: 'auth', title: 'Sign Up', titleHindi: 'साइन अप' },
        { id: 'profile', title: 'Personal Info', titleHindi: 'व्यक्तिगत जानकारी' },
        { id: 'work', title: 'Work Details', titleHindi: 'कार्य विवरण' },
      ]
    case 'ngo_partner':
      return [
        { id: 'auth', title: 'Sign Up', titleHindi: 'साइन अप' },
        { id: 'profile', title: 'Personal Info', titleHindi: 'व्यक्तिगत जानकारी' },
        { id: 'organization', title: 'Organization', titleHindi: 'संगठन' },
      ]
    default:
      return [
        { id: 'auth', title: 'Sign Up', titleHindi: 'साइन अप' },
        { id: 'profile', title: 'Profile', titleHindi: 'प्रोफाइल' },
        { id: 'health', title: 'Health', titleHindi: 'स्वास्थ्य' },
      ]
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const { user: authUser, profile } = useAuth()
  const { redirectToDashboard } = useRoleRedirect()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [userRole, setUserRole] = React.useState<UserRole>('user')
  const [userId, setUserId] = React.useState<string | null>(null)

  // Redirect if user is already fully registered (has both auth and profile)
  React.useEffect(() => {
    if (authUser && profile) {
      redirectToDashboard()
    }
  }, [authUser, profile, redirectToDashboard])

  // Check if user came from OAuth callback and pre-fill user info
  React.useEffect(() => {
    const checkOAuthAndUser = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const oauthRole = searchParams.get('role') || 'user' // Default to 'user' if not specified
      const isOAuth = searchParams.get('oauth') === 'true'

      if (isOAuth) {
        setUserRole(oauthRole as UserRole)
        // Clear the query params
        window.history.replaceState({}, '', window.location.pathname)
        
        // Get current user session to pre-fill email
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUserId(session.user.id)
          // Pre-fill email if available from OAuth
          if (session.user.email) {
            setFormData(prev => ({ ...prev, email: session.user.email || '' }))
          }
          // Pre-fill name if available from user metadata
          if (session.user.user_metadata?.full_name) {
            setFormData(prev => ({ ...prev, name: session.user.user_metadata.full_name }))
          } else if (session.user.user_metadata?.name) {
            setFormData(prev => ({ ...prev, name: session.user.user_metadata.name }))
          }
        }
        
        // Move to profile step since OAuth already created the account
        setCurrentStep(1)
      }
    }
    
    checkOAuthAndUser()
  }, [])
  
  // Common fields
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    age: '',
    village: '',
    district: '',
    state: '',
    // User-specific
    isPregnant: false,
    lastPeriodDate: '',
    // ASHA worker-specific
    employeeId: '',
    certificationDate: '',
    supervisorName: '',
    assignedVillages: '',
    // NGO-specific
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    focusAreas: '',
  })

  const steps = getSteps(userRole)

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getThemeColors = () => {
    switch (userRole) {
      case 'asha_worker':
        return {
          primary: 'bg-emerald-500 hover:bg-emerald-600',
          border: 'border-emerald-200',
          text: 'text-emerald-600',
          light: 'bg-emerald-50',
          gradient: 'from-emerald-50 via-white to-emerald-50',
          icon: 'from-emerald-400 to-emerald-600',
        }
      case 'ngo_partner':
        return {
          primary: 'bg-indigo-500 hover:bg-indigo-600',
          border: 'border-indigo-200',
          text: 'text-indigo-600',
          light: 'bg-indigo-50',
          gradient: 'from-indigo-50 via-white to-indigo-50',
          icon: 'from-indigo-400 to-indigo-600',
        }
      default:
        return {
          primary: 'bg-pink-500 hover:bg-pink-600',
          border: 'border-pink-200',
          text: 'text-pink-600',
          light: 'bg-pink-50',
          gradient: 'from-pink-50 via-white to-pink-50',
          icon: 'from-pink-400 to-pink-600',
        }
    }
  }

  const theme = getThemeColors()

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your configuration.')
      }

      // Store the selected role in sessionStorage so we can retrieve it after OAuth callback
      sessionStorage.setItem('signup_role', userRole)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${userRole}`,
        }
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Google signup error:', err)
      setError(err.message || 'Failed to sign up with Google. Please try again.')
      setIsLoading(false)
    }
  }

  const handleEmailSignup = async () => {
    if (!formData.email || !formData.password) {
      setError('Please enter email and password')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your configuration.')
      }
      
      if (!supabase.auth) {
        throw new Error('Supabase auth module not available. Please check your Supabase configuration.')
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address')
      }
      
      // Sign up the user
      // Note: If email confirmation is disabled in Supabase dashboard, 
      // users will be auto-confirmed and won't hit rate limits
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (error) {
        console.error('Signup error:', error)
        
        // Handle common errors
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          throw new Error('An account with this email already exists. Please try logging in instead.')
        }
        
        throw error
      }
      
      if (!data?.user) {
        throw new Error('Account created but user data not available')
      }
      
      setUserId(data.user.id)
      
      // Sign in the user immediately after signup to ensure session is active
      // This is needed for RLS policies to work when saving the profile
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      
      if (signInError) {
        console.error('Auto sign-in error:', signInError)
        
        // Handle rate limit errors
        if (signInError.message?.includes('rate limit') || 
            signInError.message?.includes('Rate limit') ||
            signInError.code === 'rate_limit_exceeded') {
          setError('Too many attempts. Please wait a few minutes, then try logging in manually.')
          return
        }
        
        // If sign-in fails, user might need email confirmation
        // Still allow them to proceed to profile step
        if (signInError.message?.includes('Email not confirmed') || 
            signInError.message?.includes('not confirmed')) {
          setError('Please check your email to confirm your account, then try logging in.')
          return
        }
        
        // For other errors, allow user to proceed - they can complete profile and login later
        console.warn('Sign-in after signup failed, but allowing profile completion:', signInError.message)
      }
      
      // Verify we have a session before proceeding
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !signInData?.session) {
        console.warn('No active session after signup and sign-in attempt')
      }
      
      setCurrentStep(1)
    } catch (err: any) {
      console.error('Email signup error:', err)
      
      // Handle common errors
      if (err.message?.includes('already registered') || 
                 err.message?.includes('already exists') ||
                 err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please try logging in instead.')
      } else {
        setError(err.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 0) {
      handleEmailSignup()
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const supabase = getSupabaseClient()
      
      // Ensure user is signed in before saving profile (needed for RLS)
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Try to sign in again if session is missing
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (signInError) {
          throw new Error(`Authentication failed: ${signInError.message}`)
        }
        session = signInData?.session || null
      }

      // Get the current user ID from session (more reliable than stored userId)
      const currentUserId = session?.user?.id || userId
      if (!currentUserId) {
        throw new Error('User ID not available. Please try registering again.')
      }

      // Save to appropriate table based on role
      if (userRole === 'user') {
        // First, check if user already exists
        let ashaUser
        const { data: existingUser } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', currentUserId)
          .maybeSingle()

        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabase
            .from('asha_users')
            .update({
              full_name: formData.name,
              phone_number: formData.phone,
              age: parseInt(formData.age) || null,
              role: 'user',
            })
            .eq('auth_id', currentUserId)

          if (updateError) {
            console.error('User update error:', updateError)
            throw new Error(`Failed to update user: ${updateError.message}`)
          }
          ashaUser = existingUser
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from('asha_users')
            .insert({
              auth_id: currentUserId,
              full_name: formData.name,
              phone_number: formData.phone,
              age: parseInt(formData.age) || null,
              role: 'user',
            })
            .select('id')
            .single()

          if (insertError || !newUser) {
            console.error('User creation error:', insertError)
            throw new Error(`Failed to create user: ${insertError?.message || 'Unknown error'}`)
          }
          ashaUser = newUser
        }

        if (!ashaUser?.id) {
          throw new Error('Failed to get user ID')
        }

        // Then, create/update the asha_user_profiles record
        const { data: existingProfile } = await supabase
          .from('asha_user_profiles')
          .select('id')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (existingProfile) {
          // Update existing profile
          const { error: profileError } = await supabase
            .from('asha_user_profiles')
            .update({
              village: formData.village,
              district: formData.district || 'Unknown', // district is required
              state: formData.state || 'India',
              is_currently_pregnant: formData.isPregnant,
              last_period_date: formData.lastPeriodDate || null,
            })
            .eq('user_id', ashaUser.id)

          if (profileError) {
            console.error('Profile update error:', profileError)
            throw new Error(`Failed to update user profile: ${profileError.message}`)
          }
        } else {
          // Create new profile
          const { error: profileError } = await supabase
            .from('asha_user_profiles')
            .insert({
              user_id: ashaUser.id,
              village: formData.village,
              district: formData.district || 'Unknown', // district is required
              state: formData.state || 'India',
              is_currently_pregnant: formData.isPregnant,
              last_period_date: formData.lastPeriodDate || null,
            })

          if (profileError) {
            console.error('Profile save error:', profileError)
            throw new Error(`Failed to save user profile: ${profileError.message}`)
          }
        }
        
        console.log('User profile saved successfully')
        router.push('/user-dashboard')
        
      } else if (userRole === 'asha_worker') {
        // First, check if user already exists
        let ashaUser
        const { data: existingUser } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', currentUserId)
          .maybeSingle()

        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabase
            .from('asha_users')
            .update({
              full_name: formData.name,
              phone_number: formData.phone,
              age: parseInt(formData.age) || null,
              role: 'asha_worker',
            })
            .eq('auth_id', currentUserId)

          if (updateError) {
            console.error('User update error:', updateError)
            throw new Error(`Failed to update user: ${updateError.message}`)
          }
          ashaUser = existingUser
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from('asha_users')
            .insert({
              auth_id: currentUserId,
              full_name: formData.name,
              phone_number: formData.phone,
              age: parseInt(formData.age) || null,
              role: 'asha_worker',
            })
            .select('id')
            .single()

          if (insertError || !newUser) {
            console.error('User creation error:', insertError)
            throw new Error(`Failed to create user: ${insertError?.message || 'Unknown error'}`)
          }
          ashaUser = newUser
        }

        if (!ashaUser?.id) {
          throw new Error('Failed to get user ID')
        }

        // Convert assigned_villages string to array
        const assignedVillagesArray = formData.assignedVillages
          ? formData.assignedVillages.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : []
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('asha_worker_profiles')
          .select('id')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (existingProfile) {
          // Update existing profile
          const { error: profileError } = await supabase
            .from('asha_worker_profiles')
            .update({
              worker_id: formData.employeeId,
              certification_date: formData.certificationDate || null,
              supervisor_name: formData.supervisorName,
              assigned_villages: assignedVillagesArray,
              assigned_district: formData.district || 'Unknown',
            })
            .eq('user_id', ashaUser.id)

          if (profileError) {
            console.error('Profile update error:', profileError)
            throw new Error(`Failed to update ASHA worker profile: ${profileError.message}`)
          }
        } else {
          // Create new profile
          const { error: profileError } = await supabase
            .from('asha_worker_profiles')
            .insert({
              user_id: ashaUser.id,
              worker_id: formData.employeeId,
              certification_date: formData.certificationDate || null,
              supervisor_name: formData.supervisorName,
              assigned_villages: assignedVillagesArray,
              assigned_district: formData.district || 'Unknown',
            })

          if (profileError) {
            console.error('Profile save error:', profileError)
            throw new Error(`Failed to save ASHA worker profile: ${profileError.message}`)
          }
        }
        
        console.log('ASHA worker profile saved successfully')
        router.push('/dashboard')
        
      } else if (userRole === 'ngo_partner') {
        // First, check if user already exists
        let ashaUser
        const { data: existingUser } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', currentUserId)
          .maybeSingle()

        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabase
            .from('asha_users')
            .update({
              full_name: formData.name,
              phone_number: formData.phone,
              age: parseInt(formData.age) || null,
              role: 'ngo_partner',
            })
            .eq('auth_id', currentUserId)

          if (updateError) {
            console.error('User update error:', updateError)
            throw new Error(`Failed to update user: ${updateError.message}`)
          }
          ashaUser = existingUser
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from('asha_users')
            .insert({
              auth_id: currentUserId,
              full_name: formData.name,
              phone_number: formData.phone,
              age: parseInt(formData.age) || null,
              role: 'ngo_partner',
            })
            .select('id')
            .single()

          if (insertError || !newUser) {
            console.error('User creation error:', insertError)
            throw new Error(`Failed to create user: ${insertError?.message || 'Unknown error'}`)
          }
          ashaUser = newUser
        }

        if (!ashaUser?.id) {
          throw new Error('Failed to get user ID')
        }

        // Convert focus_areas string to array
        const focusAreasArray = formData.focusAreas
          ? formData.focusAreas.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : []
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('ngo_partner_profiles')
          .select('id')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (existingProfile) {
          // Update existing profile
          const { error: profileError } = await supabase
            .from('ngo_partner_profiles')
            .update({
              organization_name: formData.organizationName,
              organization_type: formData.organizationType,
              registration_number: formData.registrationNumber,
              focus_areas: focusAreasArray,
              email: formData.email,
            })
            .eq('user_id', ashaUser.id)

          if (profileError) {
            console.error('NGO Profile update error:', profileError)
            throw new Error(`Failed to update NGO profile: ${profileError.message}`)
          }
        } else {
          // Create new profile
          const { error: profileError } = await supabase
            .from('ngo_partner_profiles')
            .insert({
              user_id: ashaUser.id,
              organization_name: formData.organizationName,
              organization_type: formData.organizationType,
              registration_number: formData.registrationNumber,
              focus_areas: focusAreasArray,
              email: formData.email,
            })

          if (profileError) {
            console.error('NGO Profile save error:', profileError)
            throw new Error(`Failed to save NGO profile: ${profileError.message}`)
          }
        }
        
        console.log('NGO partner profile saved successfully')
        router.push('/ngo/dashboard')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Failed to complete registration')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'asha_worker': return Users
      case 'ngo_partner': return Building2
      default: return Heart
    }
  }

  const RoleIcon = getRoleIcon()

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} flex items-center justify-center p-4 relative`}>
      {/* Back Button - Only show on first step */}
      {currentStep === 0 && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.icon} mx-auto mb-3 flex items-center justify-center`}>
            <RoleIcon className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {userRole === 'asha_worker' ? 'ASHA Worker Registration' : 
             userRole === 'ngo_partner' ? 'NGO Partner Registration' : 
             'Create Account'}
          </h1>
          <p className={`${theme.text} font-hindi`}>
            {userRole === 'asha_worker' ? 'आशा कार्यकर्ता पंजीकरण' : 
             userRole === 'ngo_partner' ? 'NGO साथी पंजीकरण' : 
             'खाता बनाएं'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                index === currentStep ? theme.primary.split(' ')[0] + ' text-white' :
                index < currentStep ? theme.light + ' ' + theme.text : 'bg-gray-200 text-gray-500'
              )}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-1 rounded',
                  index < currentStep ? theme.light : 'bg-gray-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className={`${theme.border} shadow-lg`}>
          <CardHeader>
            <CardTitle className="text-center">
              {steps[currentStep].title}
            </CardTitle>
            <p className={`text-center text-sm ${theme.text} font-hindi`}>
              {steps[currentStep].titleHindi}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Authentication */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Role Selection */}
                <div>
                  <Label>Sign Up As / के रूप में साइन अप करें</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={userRole === 'user' ? 'default' : 'outline'}
                      className={cn(
                        userRole === 'user' ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'border-pink-200',
                        'flex flex-col h-16 gap-1'
                      )}
                      onClick={() => setUserRole('user')}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="text-xs">User</span>
                    </Button>
                    <Button
                      type="button"
                      variant={userRole === 'asha_worker' ? 'default' : 'outline'}
                      className={cn(
                        userRole === 'asha_worker' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-emerald-200',
                        'flex flex-col h-16 gap-1'
                      )}
                      onClick={() => setUserRole('asha_worker')}
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-xs">ASHA</span>
                    </Button>
                    <Button
                      type="button"
                      variant={userRole === 'ngo_partner' ? 'default' : 'outline'}
                      className={cn(
                        userRole === 'ngo_partner' ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border-indigo-200',
                        'flex flex-col h-16 gap-1'
                      )}
                      onClick={() => setUserRole('ngo_partner')}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="text-xs">NGO</span>
                    </Button>
                  </div>
                </div>

                {/* Google Signup */}
                <Button
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  variant="outline"
                  className={`w-full border-gray-300 hover:bg-gray-50 py-6 text-lg ${theme.border}`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
                  </div>
                </div>

                {/* Email Signup */}
                <div>
                  <Label>Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`pl-10 ${theme.border}`}
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className={`pl-10 ${theme.border}`}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700">{error}</p>
                        {error.includes('relation') && error.includes('does not exist') && (
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Database issue:</strong> Visit <a href="/test-db" className="underline">Test Database</a> page to fix.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Profile - Common fields */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Full Name / पूरा नाम</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className={`pl-10 ${theme.border}`}
                    />
                  </div>
                </div>

                <div>
                  <Label>Phone Number / फोन नंबर</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className={`pl-10 ${theme.border}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Age / उम्र</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => updateFormData('age', e.target.value)}
                      className={theme.border}
                    />
                  </div>
                  <div>
                    <Label>State / राज्य</Label>
                    <Input
                      placeholder="Uttar Pradesh"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className={theme.border}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Village / गांव</Label>
                    <Input
                      placeholder="Village name"
                      value={formData.village}
                      onChange={(e) => updateFormData('village', e.target.value)}
                      className={theme.border}
                    />
                  </div>
                  <div>
                    <Label>District / जिला</Label>
                    <Input
                      placeholder="District name"
                      value={formData.district}
                      onChange={(e) => updateFormData('district', e.target.value)}
                      className={theme.border}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Role-specific fields */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* User: Health Info */}
                {userRole === 'user' && (
                  <>
                    <div>
                      <Label className="mb-3 block">Are you pregnant? / क्या आप गर्भवती हैं?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateFormData('isPregnant', true)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-center transition-all',
                            formData.isPregnant
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-pink-200 hover:border-pink-300'
                          )}
                        >
                          <span className="text-2xl block mb-1">🤰</span>
                          <span className="font-medium">Yes / हां</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFormData('isPregnant', false)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-center transition-all',
                            !formData.isPregnant
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-pink-200 hover:border-pink-300'
                          )}
                        >
                          <span className="text-2xl block mb-1">👩</span>
                          <span className="font-medium">No / नहीं</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label>Last Period Date / आखिरी पीरियड की तारीख</Label>
                      <div className="relative mt-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="date"
                          value={formData.lastPeriodDate}
                          onChange={(e) => updateFormData('lastPeriodDate', e.target.value)}
                          className="pl-10 border-pink-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ASHA Worker: Work Details */}
                {userRole === 'asha_worker' && (
                  <>
                    <div>
                      <Label>Employee ID / कर्मचारी आईडी</Label>
                      <div className="relative mt-1">
                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="ASHA-12345"
                          value={formData.employeeId}
                          onChange={(e) => updateFormData('employeeId', e.target.value)}
                          className="pl-10 border-emerald-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Certification Date / प्रमाणन तिथि</Label>
                      <div className="relative mt-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="date"
                          value={formData.certificationDate}
                          onChange={(e) => updateFormData('certificationDate', e.target.value)}
                          className="pl-10 border-emerald-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Supervisor Name / पर्यवेक्षक का नाम</Label>
                      <Input
                        placeholder="Dr. Sharma"
                        value={formData.supervisorName}
                        onChange={(e) => updateFormData('supervisorName', e.target.value)}
                        className="border-emerald-200"
                      />
                    </div>

                    <div>
                      <Label>Assigned Villages / नियुक्त गांव</Label>
                      <Input
                        placeholder="Village 1, Village 2, Village 3"
                        value={formData.assignedVillages}
                        onChange={(e) => updateFormData('assignedVillages', e.target.value)}
                        className="border-emerald-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple villages with commas</p>
                    </div>
                  </>
                )}

                {/* NGO Partner: Organization Details */}
                {userRole === 'ngo_partner' && (
                  <>
                    <div>
                      <Label>Organization Name / संगठन का नाम</Label>
                      <div className="relative mt-1">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="NGO Foundation"
                          value={formData.organizationName}
                          onChange={(e) => updateFormData('organizationName', e.target.value)}
                          className="pl-10 border-indigo-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Organization Type / संगठन का प्रकार</Label>
                      <select
                        value={formData.organizationType}
                        onChange={(e) => updateFormData('organizationType', e.target.value)}
                        className="w-full h-10 px-3 border border-indigo-200 rounded-md bg-white"
                      >
                        <option value="">Select type</option>
                        <option value="health">Health NGO</option>
                        <option value="women">Women Empowerment</option>
                        <option value="education">Education</option>
                        <option value="rural">Rural Development</option>
                        <option value="government">Government Partner</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label>Registration Number / पंजीकरण संख्या</Label>
                      <div className="relative mt-1">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="NGO/REG/2024/1234"
                          value={formData.registrationNumber}
                          onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                          className="pl-10 border-indigo-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Focus Areas / कार्य क्षेत्र</Label>
                      <Input
                        placeholder="Maternal Health, Nutrition, Child Care"
                        value={formData.focusAreas}
                        onChange={(e) => updateFormData('focusAreas', e.target.value)}
                        className="border-indigo-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {error && currentStep > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    {error.includes('relation') && error.includes('does not exist') && (
                      <p className="text-xs text-red-600 mt-1">
                        <strong>Database table missing:</strong> <a href="/test-db" className="underline">Visit this link to create the table</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className={`flex-1 ${theme.border}`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading || (currentStep === 0 && (!formData.email || !formData.password))}
                className={`flex-1 ${theme.primary}`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentStep === steps.length - 1 ? (
                  'Create Account'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className={`${theme.text} font-medium hover:underline`}>
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

