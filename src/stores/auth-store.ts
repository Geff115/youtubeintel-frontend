import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, handleAPIError } from '@/lib/api'
import { GoogleAuthHelper, GoogleUser } from '@/lib/google-auth'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  signin: (email: string, password: string) => Promise<void>
  signinWithGoogle: () => Promise<void>
  signup: (data: SignupData) => Promise<void>
  signupWithGoogle: (ageConfirmed?: boolean, agreedToTerms?: boolean) => Promise<void>
  signout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  fetchUser: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

interface SignupData {
  email: string
  password: string
  first_name: string
  last_name: string
  age_confirmed: boolean
  agreed_to_terms: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signin: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.signin({ email, password })
          
          // Store tokens
          localStorage.setItem('access_token', response.access_token)
          localStorage.setItem('refresh_token', response.refresh_token)
          
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      signinWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          // Initialize Google Auth
          const googleAuth = GoogleAuthHelper.getInstance()
          await googleAuth.initializeGoogleSignIn()
          
          // Get ID token from Google
          const idToken = await googleAuth.signInWithPopup()
          
          // Send to backend
          const response = await authAPI.signinWithGoogle({ id_token: idToken })
          
          if (response.access_token) {
            // Store tokens
            localStorage.setItem('access_token', response.access_token)
            localStorage.setItem('refresh_token', response.refresh_token)
            
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            })
          } else if (response.signup_required) {
            // User needs to complete signup
            set({ isLoading: false })
            throw new Error('Account not found. Please sign up first.')
          }
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.signup(data)
          set({ isLoading: false })
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      signupWithGoogle: async (ageConfirmed = true, agreedToTerms = true) => {
        set({ isLoading: true, error: null })
        try {
          // Initialize Google Auth
          const googleAuth = GoogleAuthHelper.getInstance()
          await googleAuth.initializeGoogleSignIn()
          
          // Get ID token from Google
          const idToken = await googleAuth.signInWithPopup()
          
          // Send to backend
          const response = await authAPI.signupWithGoogle({
            id_token: idToken,
            age_confirmed: ageConfirmed,
            agreed_to_terms: agreedToTerms,
          })
          
          set({ isLoading: false })
          // Check if the response indicates successful signup
          if (response.success || response.user) {
            // Return success response
            return {
              ...response,
              success: true
            }
          }
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      signout: async () => {
        set({ isLoading: true })
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          await authAPI.signout(refreshToken || undefined)
        } catch (error) {
          // Ignore signout errors
          console.warn('Signout API call failed:', error)
        } finally {
          // Always clear local state and tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          })
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.forgotPassword(email)
          set({ isLoading: false })
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.resetPassword(token, newPassword)
          set({ isLoading: false })
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.verifyEmail(token)
          set({ isLoading: false })
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.resendVerification(email)
          set({ isLoading: false })
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.changePassword(currentPassword, newPassword)
          set({ isLoading: false })
          return response
        } catch (error: any) {
          const apiError = handleAPIError(error)
          set({ 
            error: apiError.message, 
            isLoading: false 
          })
          throw error
        }
      },

      fetchUser: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const response = await authAPI.getMe()
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error: any) {
          // If fetching user fails, clear auth state
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)