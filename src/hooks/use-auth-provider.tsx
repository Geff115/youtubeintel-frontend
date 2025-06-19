'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { authAPI } from '@/lib/api'

export function useAuthProvider() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { user, isAuthenticated, fetchUser, signout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        
        if (token) {
          // Set token as cookie for middleware
          document.cookie = `access_token=${token}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`
          
          // Verify token is still valid
          await fetchUser()
        } else {
          // Clear any existing cookies
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        // Token is invalid, clear everything
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        
        // If we're on a protected route, redirect to signin
        if (pathname.startsWith('/dashboard')) {
          router.push(`/auth/signin?redirect=${encodeURIComponent(pathname)}`)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [fetchUser, router, pathname])

  // Set up token refresh interceptor
  useEffect(() => {
    const setupTokenRefresh = () => {
      // This will be handled by the API interceptor, but we can add additional logic here
      const handleTokenRefresh = async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            const response = await authAPI.refreshToken(refreshToken)
            const newToken = response.access_token
            
            // Update localStorage
            localStorage.setItem('access_token', newToken)
            
            // Update cookie for middleware
            document.cookie = `access_token=${newToken}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`
            
            return newToken
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          await signout()
          router.push('/auth/signin')
        }
      }

      return handleTokenRefresh
    }

    if (isAuthenticated) {
      setupTokenRefresh()
    }
  }, [isAuthenticated, signout, router])

  // Update cookies when auth state changes
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (token && refreshToken && isAuthenticated) {
      // Set secure cookies for middleware
      document.cookie = `access_token=${token}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`
    } else {
      // Clear cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }, [isAuthenticated, user])

  return {
    isInitialized,
    isAuthenticated,
    user,
    isLoading: !isInitialized
  }
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, isLoading } = useAuthProvider()

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Loading YouTubeIntel
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}