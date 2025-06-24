'use client'

import React, { useEffect, useState } from 'react'
import { 
  Play,  
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertTriangle,
  Eye,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWebSocket } from '@/components/websocket-provider'
import { cn } from '@/lib/utils'

interface Job {
  id: string
  job_id: string
  job_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  error?: string
  created_at: string
  updated_at: string
  total_items?: number
  processed_items?: number
}

interface JobMonitoringProps {
  showCompleted?: boolean
  limit?: number
  autoRefresh?: boolean
}

export function JobMonitoring({ 
  showCompleted = true, 
  limit = 10, 
  autoRefresh = true 
}: JobMonitoringProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const { connected, jobUpdates, subscribeToJob } = useWebSocket()

  // Fetch initial jobs
  useEffect(() => {
    fetchJobs()
  }, [])

  // Update jobs from WebSocket
  useEffect(() => {
    if (jobUpdates.length > 0) {
      const latestUpdate = jobUpdates[jobUpdates.length - 1]
      
      setJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job => {
          if (job.job_id === latestUpdate.job_id) {
            return {
              ...job,
              status: latestUpdate.status,
              progress: latestUpdate.progress,
              message: latestUpdate.message,
              error: latestUpdate.error,
              updated_at: latestUpdate.timestamp
            }
          }
          return job
        })
        
        // If job not found in existing list, it might be new
        const existingJob = prevJobs.find(job => job.job_id === latestUpdate.job_id)
        if (!existingJob) {
          // Fetch fresh data to get the new job
          fetchJobs()
        }
        
        return updatedJobs
      })
    }
  }, [jobUpdates])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribeToJob = (jobId: string) => {
    subscribeToJob(jobId)
  }

  const handleViewDetails = (job: Job) => {
    // Navigate to job details page or open modal
    console.log('View job details:', job)
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (response.ok) {
        fetchJobs() // Refresh jobs list
      }
    } catch (error) {
      console.error('Failed to cancel job:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'success',
      failed: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatJobType = (jobType: string) => {
    return jobType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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

  const filteredJobs = jobs
    .filter(job => showCompleted || job.status !== 'completed')
    .slice(0, limit)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Processing Jobs</span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              connected ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchJobs}
            disabled={loading}
          >
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Real-time monitoring of your background jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No active jobs found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.job_id}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(job.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatJobType(job.job_type)}
                      </h4>
                      {getStatusBadge(job.status)}
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      ID: {job.job_id}
                    </p>
                    
                    {job.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {job.message}
                      </p>
                    )}
                    
                    {job.error && (
                      <p className="text-xs text-red-600 mb-1 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {job.error}
                      </p>
                    )}
                    
                    {job.status === 'running' && job.progress !== undefined && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Started {formatTime(job.created_at)}</span>
                      {job.total_items && (
                        <span>
                          {job.processed_items || 0} / {job.total_items} items
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {job.status === 'running' && !connected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubscribeToJob(job.job_id)}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(job)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  
                  {(job.status === 'pending' || job.status === 'running') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelJob(job.job_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}