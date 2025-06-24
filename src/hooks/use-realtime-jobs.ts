import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'
import { useQueryClient } from '@tanstack/react-query'

interface JobUpdate {
  job_id: string
  job_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  error?: string
  timestamp: string
}

interface JobCompleted {
  job_id: string
  job_type: string
  total_items?: number
  message: string
  timestamp: string
}

interface CreditsUpdate {
  type: 'purchase' | 'usage' | 'purchase_pending'
  amount: number
  new_balance: number
  message: string
  timestamp: string
}

interface DiscoveryResults {
  channel_count: number
  discovery_method: string
  job_id?: string
  message: string
  timestamp: string
}

export function useRealtimeJobs() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([])
  const [completedJobs, setCompletedJobs] = useState<JobCompleted[]>([])
  const [creditUpdates, setCreditUpdates] = useState<CreditsUpdate[]>([])
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResults[]>([])
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('access_token')
  }, [])

  const connect = useCallback(() => {
    if (!user || connected) return  // Use connected state instead of socket?.connected

    const token = getAuthToken()
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://youtubeintel-backend.onrender.com'
      : 'http://localhost:5000'

    console.log('Connecting to WebSocket:', socketUrl)

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      autoConnect: true
    })

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id)
      setConnected(true) // Update state
      reconnectAttemptsRef.current = 0
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setConnected(false) // Update state
      
      // Attempt to reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect automatically
        return
      }
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        setTimeout(() => {
          console.log(`🔄 Reconnecting attempt ${reconnectAttemptsRef.current}...`)
          newSocket.connect()
        }, 2000 * reconnectAttemptsRef.current) // Exponential backoff
      }
    })

    newSocket.on('connection_status', (data) => {
      console.log('📡 Connection status:', data)
    })

    newSocket.on('job_update', (data: JobUpdate) => {
      console.log('📊 Job update:', data)
      setJobUpdates(prev => {
        const filtered = prev.filter(job => job.job_id !== data.job_id)
        return [...filtered, data].slice(-20) // Keep last 20 updates
      })
      
      // Invalidate job queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-status', data.job_id] })
    })

    newSocket.on('job_completed', (data: JobCompleted) => {
      console.log('✅ Job completed:', data)
      setCompletedJobs(prev => [data, ...prev].slice(0, 10)) // Keep last 10
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Job Completed: ${data.job_type}`, {
          body: data.message,
          icon: '/favicon.ico'
        })
      }
      
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    })

    newSocket.on('credits_updated', (data: CreditsUpdate) => {
      console.log('💰 Credits updated:', data)
      setCreditUpdates(prev => [data, ...prev].slice(0, 10))
      
      // Show notification for credit purchases
      if (data.type === 'purchase' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Credits Purchased!', {
          body: `+${data.amount} credits added to your account`,
          icon: '/favicon.ico'
        })
      }
      
      // Refresh user data and credit balance
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    })

    newSocket.on('discovery_results', (data: DiscoveryResults) => {
      console.log('🔍 Discovery results:', data)
      setDiscoveryResults(prev => [data, ...prev].slice(0, 10))
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Channels Discovered!', {
          body: data.message,
          icon: '/favicon.ico'
        })
      }
      
      // Refresh channels data
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    })

    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
    })

    setSocket(newSocket)

    return newSocket
  }, [user, queryClient, getAuthToken, connected])

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('🔌 Disconnecting WebSocket')
      socket.disconnect()
      setSocket(null)
      setConnected(false) // Update state
    }
  }, [socket])

  const subscribeToJob = useCallback((jobId: string) => {
    if (socket && connected) {
        console.log('🔔 Subscribing to job:', jobId)
        socket.emit('subscribe_to_job', { job_id: jobId })
    }
  }, [socket, connected])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Connect when user is available
  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }

    return () => disconnect()
  }, [user, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    socket,
    connected,
    jobUpdates,
    completedJobs,
    creditUpdates,
    discoveryResults,
    subscribeToJob,
    connect,
    disconnect,
    clearJobUpdates: () => setJobUpdates([]),
    clearCompletedJobs: () => setCompletedJobs([]),
    clearCreditUpdates: () => setCreditUpdates([]),
    clearDiscoveryResults: () => setDiscoveryResults([])
  }
}