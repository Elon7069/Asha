import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Helper function to check if user has a profile
async function checkUserProfile(supabase: any, authUserId: string): Promise<boolean> {
  try {
    // First check if user exists in asha_users
    const { data: ashaUser } = await supabase
      .from('asha_users')
      .select('id, role')
      .eq('auth_id', authUserId)
      .maybeSingle()

    if (!ashaUser) return false

    // Check asha_user_profiles for regular users
    if (ashaUser.role === 'user') {
      const { data: userProfile } = await supabase
        .from('asha_user_profiles')
        .select('id')
        .eq('user_id', ashaUser.id)
        .maybeSingle()

      if (userProfile) return true
    }

    // Check asha_worker_profiles
    if (ashaUser.role === 'asha_worker') {
      const { data: ashaProfile } = await supabase
        .from('asha_worker_profiles')
        .select('id')
        .eq('user_id', ashaUser.id)
        .maybeSingle()

      if (ashaProfile) return true
    }

    // Check ngo_partner_profiles
    if (ashaUser.role === 'ngo_partner') {
      const { data: ngoProfile } = await supabase
        .from('ngo_partner_profiles')
        .select('id')
        .eq('user_id', ashaUser.id)
        .maybeSingle()

      if (ngoProfile) return true
    }

    return false
  } catch (error) {
    console.error('Error checking user profile:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const role = searchParams.get('role')
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('code')

  // Handle OAuth callback
  if (code) {
    const supabase = await createServerSupabaseClient()
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Check if user has a profile
      const hasProfile = await checkUserProfile(supabase, data.user.id)
      
      if (!hasProfile) {
        // User doesn't have a profile, redirect to register
        redirectTo.pathname = '/register'
        redirectTo.searchParams.set('role', role || 'user')
        redirectTo.searchParams.set('oauth', 'true')
      } else if (role) {
        // User has profile but role was provided (from signup flow)
        // Redirect to appropriate dashboard based on their actual profile
        redirectTo.pathname = '/'
      } else {
        // User has profile and is logging in, redirect to home (will be handled by middleware/AuthContext)
        redirectTo.pathname = '/'
      }
      return NextResponse.redirect(redirectTo)
    }
  }

  // Handle OTP verification
  if (token_hash && type) {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    
    if (!error) {
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
  }

  // Return the user to an error page with some instructions
  redirectTo.pathname = '/auth/auth-code-error'
  return NextResponse.redirect(redirectTo)
}