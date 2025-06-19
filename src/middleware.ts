import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected and public routes
const protectedRoutes = ['/dashboard']
const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']
const publicRoutes = ['/', '/about', '/pricing', '/terms', '/privacy', '/contact']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/')

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      // Store the attempted URL for redirect after login
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if token is expired (basic check - full validation happens on API calls)
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        
        if (payload.exp && payload.exp < currentTime) {
          // Token is expired, redirect to login
          const response = NextResponse.redirect(new URL('/auth/signin', request.url))
          response.cookies.delete('access_token')
          response.cookies.delete('refresh_token')
          return response
        }
      }
    } catch (error) {
      // Invalid token format, redirect to login
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      return response
    }
  }

  // Handle auth routes - redirect if already authenticated
  if (isAuthRoute && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // Only redirect if token is still valid
      if (payload.exp && payload.exp > currentTime) {
        const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    } catch (error) {
      // Invalid token, let them access auth pages
    }
  }

  // Add security headers for all routes
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}