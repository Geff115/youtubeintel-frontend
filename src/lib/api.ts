import axios, { AxiosError, AxiosResponse } from 'axios'

// API Base URL - will be configurable via environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://youtubeintel-backend.onrender.com'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          localStorage.setItem('access_token', access_token)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/auth/signin'
        }
      }
    }

    return Promise.reject(error)
  }
)

// API Error types
export interface APIError {
  message: string
  details?: Record<string, any>
  status?: number
}

// Helper function to handle API errors
export function handleAPIError(error: AxiosError): APIError {
  if (error.response?.data) {
    const data = error.response.data as any
    return {
      message: data.error || data.message || 'An error occurred',
      details: data.details,
      status: error.response.status,
    }
  }

  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timeout. Please try again.',
      status: 408,
    }
  }

  if (error.code === 'ERR_NETWORK') {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    }
  }

  return {
    message: error.message || 'An unexpected error occurred',
    status: error.response?.status || 500,
  }
}

// Generic API response type
export interface APIResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  error?: string
}

// User Deletion Types
export interface DeletionEligibilityResponse {
  can_delete: boolean
  user: {
    email: string
    credits_balance: number
    total_credits_purchased: number
    account_age_days: number
    last_activity: string | null
  }
  blockers: Array<{
    type: string
    message: string
    action: string
  }>
  warnings: Array<{
    type: string
    message: string
    action: string
  }>
  data_to_be_deleted: string[]
  support_contact: string
}

export interface DataExportResponse {
  success: boolean
  message: string
  data: {
    account_info: any
    credit_transactions: any[]
    api_usage_logs: any[]
    export_metadata: {
      exported_at: string
      export_version: string
      total_transactions: number
      total_api_calls: number
    }
  }
  notes: string[]
}

export interface AccountDeletionResponse {
  success: boolean
  message: string
  details: string
}

// Auth related API calls
export const authAPI = {
  // Sign up with email and password
  signup: async (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    age_confirmed: boolean
    agreed_to_terms: boolean
  }) => {
    const response = await api.post('/api/auth/signup', data)
    return response.data
  },

  // Sign up with Google
  signupWithGoogle: async (data: {
    id_token: string
    age_confirmed: boolean
    agreed_to_terms: boolean
  }) => {
    const response = await api.post('/api/auth/signup/google', data)
    return response.data
  },

  // Sign in with email and password
  signin: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/signin', data)
    return response.data
  },

  // Sign in with Google
  signinWithGoogle: async (data: { id_token: string }) => {
    const response = await api.post('/api/auth/signin/google', data)
    return response.data
  },

  // Sign out
  signout: async (refreshToken?: string) => {
    const response = await api.post('/api/auth/signout', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    })
    return response.data
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.post('/api/auth/verify-email', { token })
    return response.data
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    const response = await api.post('/api/auth/resend-verification', { email })
    return response.data
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/api/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },
}

// User and dashboard API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/user/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (data: {
    first_name?: string
    last_name?: string
    display_name?: string
  }) => {
    const response = await api.put('/api/user/profile', data)
    return response.data
  },

  // Upload profile picture
  uploadProfilePicture: async (formData: FormData) => {
    const response = await api.post('/api/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await api.delete('/api/user/profile-picture')
    return response.data
  },

  // Get user stats
  getStats: async () => {
    const response = await api.get('/api/stats')
    return response.data
  },

  // Get user's channels
  getChannels: async (page = 1, perPage = 20) => {
    const response = await api.get(`/api/channels?page=${page}&per_page=${perPage}`)
    return response.data
  },

  // Get user's jobs
  getJobs: async (status?: string, limit = 50) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    
    const response = await api.get(`/api/jobs?${params}`)
    return response.data
  },

  // Get specific job status
  getJobStatus: async (jobId: string) => {
    const response = await api.get(`/api/jobs/${jobId}`)
    return response.data
  },

  // User account management API calls
  // Check if user can delete their account
  checkDeletionEligibility: async () => {
    const response = await api.get('/api/user/deletion-eligibility')
    return response.data
  },

  // Request data export (GDPR compliance)
  requestDataExport: async () => {
    const response = await api.post('/api/user/request-data-export')
    return response.data
  },

  // Delete user account (destructive operation)
  deleteAccount: async () => {
    const response = await api.delete('/api/user/delete-account')
    return response.data
  },
}

// Channel discovery and processing API calls
export const channelAPI = {
  // Discover related channels
  discoverChannels: async (data: {
    channel_ids: string[]
    methods?: string[]
    limit?: number
  }) => {
    const response = await api.post('/api/discover-channels', data)
    return response.data
  },

  // Fetch channel metadata
  fetchMetadata: async (data: {
    channel_ids?: string[]
    limit?: number
  }) => {
    const response = await api.post('/api/fetch-metadata', data)
    return response.data
  },

  // Fetch channel videos
  fetchVideos: async (data: {
    channel_ids?: string[]
    videos_per_channel?: number
    limit?: number
  }) => {
    const response = await api.post('/api/fetch-videos', data)
    return response.data
  },

  // Batch processing
  batchMetadata: async (data: {
    batch_size?: number
    total_limit?: number
  }) => {
    const response = await api.post('/api/batch-metadata', data)
    return response.data
  },

  batchVideos: async (data: {
    batch_size?: number
    total_limit?: number
  }) => {
    const response = await api.post('/api/batch-videos', data)
    return response.data
  },

  batchDiscovery: async (data: {
    batch_size?: number
    total_limit?: number
  }) => {
    const response = await api.post('/api/batch-discovery', data)
    return response.data
  },
}

// Payment and credits API calls
export const paymentAPI = {
  // Get credit packages
  getCreditPackages: async () => {
    const response = await api.get('/api/credit-packages')
    return response.data
  },

  // Get user credits
  getUserCredits: async (email: string) => {
    const response = await api.get(`/api/user/${email}/credits`)
    return response.data
  },

  // Purchase credits
  purchaseCredits: async (data: {
    package_id: string
    email: string
  }) => {
    const response = await api.post('/api/purchase-credits', data)
    return response.data
  },

  // Verify payment
  verifyPayment: async (reference: string) => {
    const response = await api.get(`/api/verify-payment/${reference}`)
    return response.data
  },
}

// System health and monitoring
export const systemAPI = {
  // Health check
  health: async () => {
    const response = await api.get('/health')
    return response.data
  },

  // Test Redis connection
  testRedis: async () => {
    const response = await api.get('/api/redis-test')
    return response.data
  },

  // System status (admin only)
  systemStatus: async () => {
    const response = await api.get('/api/system-status')
    return response.data
  },
}