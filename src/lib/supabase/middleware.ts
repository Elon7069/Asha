import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
    console.error('Error checking user profile in middleware:', error)
    return false
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = ['/user-dashboard', '/asha-didi', '/period-tracker', '/pregnancy', '/nutrition', '/mental-health', '/learn', '/schemes', '/vaccinations', '/red-zone']
  const ashaWorkerRoutes = ['/asha-worker']
  const ngoRoutes = ['/ngo-partner']
  const authRoutes = ['/login', '/register', '/onboarding']

  const path = request.nextUrl.pathname

  // Check if trying to access protected routes without auth
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAshaWorkerRoute = ashaWorkerRoutes.some(route => path.startsWith(route))
  const isNgoRoute = ngoRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  if (!user && (isProtectedRoute || isAshaWorkerRoute || isNgoRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages, but only if they have a profile
  if (user && isAuthRoute) {
    // Allow access to register page if user doesn't have a profile
    if (path === '/register') {
      const hasProfile = await checkUserProfile(supabase, user.id)
      if (!hasProfile) {
        // User doesn't have profile, allow them to stay on register page
        return supabaseResponse
      }
    }
    
    // User has profile or is on login page, redirect to home
    // The AuthContext will handle the proper redirect based on role
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

