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

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null
let isConnecting = false
let lastConnectionAttempt = 0

export function useRealtimeJobs() {
  const [connected, setConnected] = useState(false)
  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([])
  const [completedJobs, setCompletedJobs] = useState<JobCompleted[]>([])
  const [creditUpdates, setCreditUpdates] = useState<CreditsUpdate[]>([])
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResults[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const componentIdRef = useRef(Math.random().toString(36).substr(2, 9))
  const stableConnectionRef = useRef(false)

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

  const setupSocketEventListeners = useCallback((socket: Socket) => {
    // Remove any existing listeners to prevent duplicates
    socket.removeAllListeners()

    // Connection Events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id, `Component: ${componentIdRef.current}`)
      setConnected(true)
      stableConnectionRef.current = true
      isConnecting = false
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason, `Component: ${componentIdRef.current}`)
      setConnected(false)
      stableConnectionRef.current = false
      
      // Don't auto-reconnect for certain reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('🛑 Server initiated disconnect, not reconnecting')
        return
      }
    })

    socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error, `Component: ${componentIdRef.current}`)
      setConnected(false)
      stableConnectionRef.current = false
      isConnecting = false
    })

    // Status Events
    socket.on('connection_status', (data: ConnectionStatus) => {
      console.log('📡 Connection status:', data)
      setConnectionStatus(data)
    })

    // Job Events
    socket.on('job_update', (data: JobUpdate) => {
      console.log('📊 Job update:', data)
      setJobUpdates(prev => {
        const filtered = prev.filter(job => job.job_id !== data.job_id)
        return [...filtered, data].slice(-20)
      })
      
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-status', data.job_id] })
    })

    socket.on('job_completed', (data: JobCompleted) => {
      console.log('✅ Job completed:', data)
      setCompletedJobs(prev => [data, ...prev].slice(0, 10))
      
      showNotification(
        `Job Completed: ${data.job_type}`,
        data.message
      )
      
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['discovery-results'] })
    })

    // Credit Events
    socket.on('credits_updated', (data: CreditsUpdate) => {
      console.log('💰 Credits updated:', data)
      setCreditUpdates(prev => [data, ...prev].slice(0, 10))
      
      if (data.type === 'purchase') {
        showNotification(
          'Credits Purchased!',
          `${data.amount} credits added to your account`
        )
      }
      
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    })

    // Discovery Events
    socket.on('discovery_results', (data: DiscoveryResults) => {
      console.log('🔍 Discovery results:', data)
      setDiscoveryResults(prev => [data, ...prev].slice(0, 10))
      
      showNotification(
        'Channel Discovery Complete!',
        `Found ${data.channel_count} channels via ${data.discovery_method}`
      )
      
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['discovery-results'] })
    })

    // Error handling
    socket.on('error', (error) => {
      console.error('🔴 WebSocket error:', error)
    })
  }, [queryClient, showNotification])

  const connect = useCallback(() => {
    // Prevent multiple connections and rate limit attempts
    const now = Date.now()
    if (isConnecting || !user || (now - lastConnectionAttempt < 3000)) {
      console.log('⏭️ Skipping connection - rate limited or already connecting')
      return
    }

    const token = getAuthToken()
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    // Use existing global socket if available and connected
    if (globalSocket && globalSocket.connected && stableConnectionRef.current) {
      console.log('♻️ Reusing existing stable WebSocket connection')
      setConnected(true)
      setupSocketEventListeners(globalSocket)
      return
    }

    // Clean up existing socket if not connected
    if (globalSocket) {
      console.log('🧹 Cleaning up existing socket')
      globalSocket.removeAllListeners()
      globalSocket.disconnect()
      globalSocket = null
    }

    isConnecting = true
    lastConnectionAttempt = now

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://youtubeintel-backend.onrender.com'
        : 'http://localhost:5000'
    )

    console.log(`🔌 Connecting to WebSocket: ${socketUrl} (Component: ${componentIdRef.current})`)

    const newSocket = io(socketUrl, {
      auth: { token: token.replace('Bearer ', '') }, // Remove Bearer prefix
      transports: ['websocket'],  // Force websockets
      timeout: 20000,
      autoConnect: true,
      forceNew: false,
      reconnection: true,  // Enable reconnection
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { token: token.replace('Bearer ', '') }, // Also remove Bearer here
      extraHeaders: {
        'Authorization': token  // Keeping Bearer here
      }
    })

    globalSocket = newSocket
    setupSocketEventListeners(newSocket)

    // Set connection timeout
    setTimeout(() => {
      if (!newSocket.connected) {
        console.warn('⏰ WebSocket connection timeout')
        isConnecting = false
        newSocket.disconnect()
      }
    }, 25000)

  }, [user, getAuthToken, setupSocketEventListeners])

  const disconnect = useCallback(() => {
    console.log(`🔌 Disconnecting WebSocket (Component: ${componentIdRef.current})`)
    
    if (globalSocket) {
      globalSocket.removeAllListeners()
      globalSocket.disconnect()
      globalSocket = null
    }
    
    setConnected(false)
    setConnectionStatus(null)
    stableConnectionRef.current = false
    isConnecting = false
  }, [])

  const subscribeToJob = useCallback((jobId: string) => {
    if (globalSocket && globalSocket.connected) {
      console.log(`📝 Subscribing to job updates: ${jobId}`)
      globalSocket.emit('subscribe_to_job', { job_id: jobId })
    } else {
      console.warn('Cannot subscribe to job - WebSocket not connected')
    }
  }, [])

  const clearHistory = useCallback(() => {
    setJobUpdates([])
    setCompletedJobs([])
    setCreditUpdates([])
    setDiscoveryResults([])
  }, [])

  // Initialize WebSocket connection only once per component
  useEffect(() => {
    if (user && !isConnecting && !stableConnectionRef.current) {
      const timeoutId = setTimeout(() => {
        requestNotificationPermission()
        connect()
      }, 1000) // Delay to prevent race conditions

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [user, connect, requestNotificationPermission])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`🧹 Component unmounting (${componentIdRef.current})`)
      // Don't disconnect global socket here - other components might be using it
    }
  }, [])

  // Handle auth changes
  useEffect(() => {
    if (!user && globalSocket) {
      console.log('👤 User logged out, disconnecting WebSocket')
      disconnect()
    }
  }, [user, disconnect])

  return {
    // Connection state
    connected,
    socket: globalSocket,
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
    
    // Utilities
    reconnectAttempts: 0,
    maxReconnectAttempts: 3
  }
}