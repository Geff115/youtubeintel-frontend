'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/components/websocket-provider'

export function WebSocketConnectionMonitor() {
  const { connected, socket, connectionStatus } = useWebSocket()
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: string
    event: string
    status: boolean
    socketId?: string
  }>>([])

  useEffect(() => {
    const addEvent = (event: string, status: boolean, socketId?: string) => {
      setConnectionHistory(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          event,
          status,
          socketId
        },
        ...prev.slice(0, 19) // Keep last 20 events
      ])
    }

    // Only track changes when connection status actually changes
    const currentConnected = socket?.connected || false
    const currentSocketId = socket?.id
    
    // Add event only when connection state changes
    if (connectionHistory.length === 0) {
      addEvent('Initial state', currentConnected, currentSocketId)
    }
    
  }, [connected, socket?.id, socket?.connected]) // Only depend on actual changes

  const getConnectionDuration = () => {
    const connectedEvents = connectionHistory.filter(e => e.status && e.event === 'Connected')
    if (connectedEvents.length === 0) return 'Never connected'
    
    const lastConnected = connectedEvents[0]
    const now = new Date()
    const connectedTime = new Date()
    connectedTime.setTime(now.getTime() - (connectionHistory.indexOf(lastConnected) * 1000))
    
    const diff = Math.floor((now.getTime() - connectedTime.getTime()) / 1000)
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>WebSocket Monitor</span>
          <Badge variant={connected ? 'default' : 'destructive'}>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Socket ID
            </label>
            <div className="text-sm font-mono">
              {socket?.id || 'None'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Connected Duration
            </label>
            <div className="text-sm">
              {connected ? getConnectionDuration() : 'Not connected'}
            </div>
          </div>
        </div>

        {/* Connection History */}
        <div>
          <h4 className="text-sm font-medium mb-2">Connection History</h4>
          <div className="max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            {connectionHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No events yet...</p>
            ) : (
              <div className="space-y-1">
                {connectionHistory.map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="font-mono">{event.timestamp}</span>
                    <span className={`px-2 py-1 rounded ${
                      event.status 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {event.event}
                    </span>
                    {event.socketId && (
                      <span className="font-mono text-slate-500 text-xs">
                        {event.socketId.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Debug Info</h4>
          <div className="text-xs font-mono space-y-1">
            <div>Socket Connected: {socket?.connected ? 'true' : 'false'}</div>
            <div>Hook Connected: {connected ? 'true' : 'false'}</div>
            <div>Transport: {socket?.io?.engine?.transport?.name || 'None'}</div>
            <div>URL: {socket?.io?.opts?.hostname ? `${socket.io.opts.hostname}${socket.io.opts.path || ''}` : 'Unavailable'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}