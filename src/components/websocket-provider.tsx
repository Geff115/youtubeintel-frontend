'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useRealtimeJobs, RealtimeState } from '@/hooks/use-realtime-jobs'

interface WebSocketContextType extends RealtimeState {
  connect: () => void
  disconnect: () => void
  subscribeToJob: (jobId: string) => void
  clearHistory: () => void
  reconnectAttempts: number
  maxReconnectAttempts: number
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const realtimeData = useRealtimeJobs()

  return (
    <WebSocketContext.Provider value={realtimeData}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Export individual hooks for specific use cases
export function useJobUpdates() {
  const { jobUpdates, subscribeToJob } = useWebSocket()
  return { jobUpdates, subscribeToJob }
}

export function useDiscoveryResults() {
  const { discoveryResults } = useWebSocket()
  return discoveryResults
}

export function useCreditUpdates() {
  const { creditUpdates } = useWebSocket()
  return creditUpdates
}

export function useConnectionStatus() {
  const { connected, connectionStatus, reconnectAttempts, maxReconnectAttempts } = useWebSocket()
  return { connected, connectionStatus, reconnectAttempts, maxReconnectAttempts }
}