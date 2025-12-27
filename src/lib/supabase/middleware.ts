import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip most middleware processing for better performance
  // Allow profile-setup and public routes
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon') ||
    path.includes('.') ||
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path === '/profile-setup'
  ) {
    return NextResponse.next()
  }

  // Since we're bypassing auth, just allow all routes
  // Profile check will be done client-side via AuthContext
  return NextResponse.next()
}

