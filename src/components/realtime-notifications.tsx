'use client'

import React, { useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, Zap, Search } from 'lucide-react'
import { useWebSocket } from './websocket-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  id: string
  title: string
  message: string
  type: 'job' | 'credits' | 'discovery' | 'connection'
  timestamp: string
  onDismiss: (id: string) => void
}

function NotificationItem({ id, title, message, type, timestamp, onDismiss }: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'job':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'credits':
        return <Zap className="w-5 h-5 text-yellow-500" />
      case 'discovery':
        return <Search className="w-5 h-5 text-blue-500" />
      case 'connection':
        return <Info className="w-5 h-5 text-gray-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="mb-3 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {message}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                {formatTime(timestamp)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(id)}
            className="h-auto p-1 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function RealtimeNotifications() {
  const { 
    jobUpdates, 
    completedJobs, 
    creditUpdates, 
    discoveryResults,
    connected 
  } = useWebSocket()
  
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
  }

  const clearAll = () => {
    const allIds = [
      ...completedJobs.map(job => `job-${job.job_id}-${job.timestamp}`),
      ...creditUpdates.map(credit => `credit-${credit.timestamp}`),
      ...discoveryResults.map(discovery => `discovery-${discovery.timestamp}`)
    ]
    setDismissed(new Set(allIds))
  }

  // Combine all notifications
  const allNotifications = [
    ...completedJobs.map(job => ({
      id: `job-${job.job_id}-${job.timestamp}`,
      title: `Job Completed: ${job.job_type}`,
      message: job.message,
      type: 'job' as const,
      timestamp: job.timestamp
    })),
    ...creditUpdates.map(credit => ({
      id: `credit-${credit.timestamp}`,
      title: credit.type === 'purchase' ? 'Credits Purchased' : 'Credits Used',
      message: credit.message,
      type: 'credits' as const,
      timestamp: credit.timestamp
    })),
    ...discoveryResults.map(discovery => ({
      id: `discovery-${discovery.timestamp}`,
      title: 'Channel Discovery Complete',
      message: discovery.message,
      type: 'discovery' as const,
      timestamp: discovery.timestamp
    }))
  ]

  // Filter out dismissed notifications and sort by timestamp
  const visibleNotifications = allNotifications
    .filter(notification => !dismissed.has(notification.id))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10) // Show only last 10

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 w-96 max-w-sm z-50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            connected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {visibleNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {visibleNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  )
}