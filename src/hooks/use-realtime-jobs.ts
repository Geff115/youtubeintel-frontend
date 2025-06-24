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

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'reconnecting'
  user_id?: string
  timestamp: string
}

export interface RealtimeState {
  connected: boolean
  socket: Socket | null
  jobUpdates: JobUpdate[]
  completedJobs: JobCompleted[]
  creditUpdates: CreditsUpdate[]
  discoveryResults: DiscoveryResults[]
  connectionStatus: ConnectionStatus | null
}

export function useRealtimeJobs() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([])
  const [completedJobs, setCompletedJobs] = useState<JobCompleted[]>([])
  const [creditUpdates, setCreditUpdates] = useState<CreditsUpdate[]>([])
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResults[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('access_token')
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }, [])

  const connect = useCallback(() => {
    if (!user || connected) return

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
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: maxReconnectAttempts
    })

    // Connection Events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id)
      setConnected(true)
      reconnectAttemptsRef.current = 0
      
      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setConnected(false)
      
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect automatically
        return
      }
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        console.log(`🔄 Reconnecting attempt ${reconnectAttemptsRef.current}...`)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error)
      setConnected(false)
    })

    // Status Events
    newSocket.on('connection_status', (data: ConnectionStatus) => {
      console.log('📡 Connection status:', data)
      setConnectionStatus(data)
    })

    // Job Events
    newSocket.on('job_update', (data: JobUpdate) => {
      console.log('📊 Job update:', data)
      setJobUpdates(prev => {
        const filtered = prev.filter(job => job.job_id !== data.job_id)
        return [...filtered, data].slice(-20)
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-status', data.job_id] })
      
      // Show progress notification for running jobs
      if (data.status === 'running' && data.progress) {
        console.log(`Job ${data.job_id} progress: ${data.progress}%`)
      }
    })

    newSocket.on('job_completed', (data: JobCompleted) => {
      console.log('✅ Job completed:', data)
      setCompletedJobs(prev => [data, ...prev].slice(0, 10))
      
      // Show success notification
      showNotification(
        `Job Completed: ${data.job_type}`,
        data.message
      )
      
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['discovery-results'] })
    })

    // Credit Events
    newSocket.on('credits_updated', (data: CreditsUpdate) => {
      console.log('💰 Credits updated:', data)
      setCreditUpdates(prev => [data, ...prev].slice(0, 10))
      
      // Show notification for credit purchases
      if (data.type === 'purchase') {
        showNotification(
          'Credits Purchased!',
          `${data.amount} credits added to your account`
        )
      }
      
      // Refresh credit balance
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    })

    // Discovery Events
    newSocket.on('discovery_results', (data: DiscoveryResults) => {
      console.log('🔍 Discovery results:', data)
      setDiscoveryResults(prev => [data, ...prev].slice(0, 10))
      
      // Show discovery notification
      showNotification(
        'Channel Discovery Complete!',
        `Found ${data.channel_count} channels via ${data.discovery_method}`
      )
      
      // Refresh discovery queries
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['discovery-results'] })
    })

    // Error handling
    newSocket.on('error', (error) => {
      console.error('🔴 WebSocket error:', error)
    })

    setSocket(newSocket)
    
    // Set connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      if (!newSocket.connected) {
        console.warn('⏰ WebSocket connection timeout')
        newSocket.disconnect()
      }
    }, 30000) // 30 second timeout

  }, [user, connected, getAuthToken, queryClient, showNotification])

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('🔌 Disconnecting WebSocket')
      socket.disconnect()
      setSocket(null)
      setConnected(false)
      setConnectionStatus(null)
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
    }
  }, [socket])

  const subscribeToJob = useCallback((jobId: string) => {
    if (socket && connected) {
      console.log(`📝 Subscribing to job updates: ${jobId}`)
      socket.emit('subscribe_to_job', { job_id: jobId })
    }
  }, [socket, connected])

  const clearHistory = useCallback(() => {
    setJobUpdates([])
    setCompletedJobs([])
    setCreditUpdates([])
    setDiscoveryResults([])
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && !socket) {
      requestNotificationPermission()
      connect()
    }
    
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
    }
  }, [user, socket, connect, requestNotificationPermission])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Auto-reconnect when user changes
  useEffect(() => {
    if (user && socket && !connected) {
      console.log('🔄 User changed, reconnecting WebSocket')
      disconnect()
      setTimeout(connect, 1000)
    }
  }, [user, socket, connected, disconnect, connect])

  return {
    // Connection state
    connected,
    socket,
    connectionStatus,
    
    // Event data
    jobUpdates,
    completedJobs,
    creditUpdates,
    discoveryResults,
    
    // Actions
    connect,
    disconnect,
    subscribeToJob,
    clearHistory,
    clearJobUpdates: () => setJobUpdates([]),
    clearCompletedJobs: () => setCompletedJobs([]),
    clearCreditUpdates: () => setCreditUpdates([]),
    clearDiscoveryResults: () => setDiscoveryResults([]),
    
    // Utilities
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts
  }
}