import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI, channelAPI, authAPI, api } from '@/lib/api'
import type { UserStats, ChannelsResponse, ProcessingJob, User } from '@/types/dashboard'

// ==========================================
// Dashboard Stats Hooks
// ==========================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: userAPI.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: userAPI.getProfile,
    staleTime: 60000, // Profile data doesn't change often
  })
}

// ==========================================
// Channels Hooks  
// ==========================================

export function useChannels(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['channels', page, perPage],
    queryFn: () => userAPI.getChannels(page, perPage),
    //keepPreviousData: true, // Keep previous page data while loading new page
  })
}

// ==========================================
// Jobs Hooks (for pages that don't need real-time updates)
// ==========================================

export function useJobs(status?: string, limit = 50) {
  return useQuery({
    queryKey: ['jobs', status, limit],
    queryFn: () => userAPI.getJobs(status, limit),
    refetchInterval: 10000, // Basic polling until WebSockets
  })
}

export function useJobStatus(jobId: string) {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => userAPI.getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: 5000, // Poll every 5 seconds for job status
  })
}

// ==========================================
// User Profile Management Hooks
// ==========================================

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      // Update the user profile cache
      queryClient.setQueryData(['user-profile'], data)
      
      // Also update the auth store user data
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { 
      currentPassword: string; 
      newPassword: string 
    }) => authAPI.changePassword(currentPassword, newPassword),
  })
}

// ==========================================
// Current User Hook (for auth state)
// ==========================================

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: authAPI.getMe,
    staleTime: 60000,
    retry: false, // Don't retry if unauthorized
  })
}

// ==========================================
// Credit Management Hooks (Non-Websocket)
// ==========================================

export function useCreditPackages() {
  return useQuery({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      const response = await api.get('/api/credit-packages')
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch credit packages')
      }
      return response.data
    },
    staleTime: 300000, // Credit packages don't change often (5 minutes)
  })
}

export function useUserCredits(email: string) {
  return useQuery({
    queryKey: ['user-credits', email],
    queryFn: async () => {
      const response = await fetch(`/api/user/${email}/credits`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user credits')
      }
      return response.json()
    },
    enabled: !!email,
  })
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ packageId, email }: { packageId: string; email: string }) => {
      const response = await api.post('/api/purchase-credits', {
        package_id: packageId,
        email: email
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries after successful purchase
      queryClient.invalidateQueries({ queryKey: ['user-credits'] })
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: ['verify-payment', reference],
    queryFn: async () => {
      const response = await fetch(`/api/verify-payment/${reference}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to verify payment')
      }
      return response.json()
    },
    enabled: !!reference,
    refetchInterval: 5000, // Poll every 5 seconds until payment is verified
  })
}

// ==========================================
// System Health Hook
// ==========================================

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => fetch('/health').then(res => res.json()),
    refetchInterval: 60000, // Check system health every minute
    retry: 1,
  })
}

// ==========================================
// Utility Hooks for Dashboard
// ==========================================

// Hook for recent activity (basic version without real-time)
export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Get recent jobs as activity
      const jobs = await userAPI.getJobs(undefined, 10)
      return jobs.map((job: ProcessingJob) => ({
        id: job.job_id,
        type: job.job_type,
        message: `${job.job_type.replace('_', ' ')} ${job.status}`,
        time: formatTimeAgo(job.created_at),
        status: job.status
      }))
    },
    refetchInterval: 30000,
  })
}

// Hook for getting user's channel summary
export function useChannelSummary() {
  return useQuery({
    queryKey: ['channel-summary'],
    queryFn: async () => {
      const stats = await userAPI.getStats()
      return {
        totalChannels: stats.total_channels || 0,
        channelsWithMetadata: stats.channels_with_metadata || 0,
        totalVideos: stats.total_videos || 0,
        recentlyAdded: 0, // Will be calculated from channels data
      }
    },
    refetchInterval: 60000,
  })
}

// ==========================================
// Helper Functions
// ==========================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

// ==========================================
// Custom Hook for Dashboard Overview Data
// ==========================================

export function useDashboardOverview() {
  const statsQuery = useDashboardStats()
  const userQuery = useCurrentUser()
  const recentActivityQuery = useRecentActivity()
  
  return {
    stats: statsQuery.data,
    user: userQuery.data?.user,
    recentActivity: recentActivityQuery.data,
    isLoading: statsQuery.isLoading || userQuery.isLoading,
    error: statsQuery.error || userQuery.error,
    refetch: () => {
      statsQuery.refetch()
      userQuery.refetch()
      recentActivityQuery.refetch()
    }
  }
}

// ==========================================
// Settings Page Specific Hooks
// ==========================================

export function useUserSessions() {
  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => fetch('/api/auth/sessions').then(res => res.json()),
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (sessionId: string) => 
      fetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })
}
