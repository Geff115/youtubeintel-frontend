import React, { useEffect } from 'react'
import { useRealtimeJobs } from '@/hooks/use-realtime-jobs'
import { useToast } from '@/components/notifications/toast-provider'
import { 
  Bell, 
  CheckCircle,  
  Loader2, 
  Search, 
  Database, 
  CreditCard,
  TrendingUp,
  Users
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function JobNotifications() {
  const { 
    connected, 
    jobUpdates, 
    completedJobs, 
    creditUpdates, 
    discoveryResults,
    clearJobUpdates,
    clearCompletedJobs 
  } = useRealtimeJobs()
  const { addToast } = useToast()

  // Show toasts for job completions
  useEffect(() => {
    completedJobs.forEach(job => {
      if (job.timestamp && new Date(job.timestamp).getTime() > Date.now() - 5000) {
        addToast({
          type: 'success',
          title: 'Job Completed!',
          description: job.message,
          duration: 6000,
          action: {
            label: 'View Results',
            onClick: () => {
              // Navigate to appropriate page based on job type
              if (job.job_type.includes('discovery')) {
                window.location.href = '/dashboard/channels'
              } else if (job.job_type.includes('metadata')) {
                window.location.href = '/dashboard/analytics'
              } else {
                window.location.href = '/dashboard/jobs'
              }
            }
          }
        })
      }
    })
  }, [completedJobs, addToast])

  // Show toasts for credit updates
  useEffect(() => {
    creditUpdates.forEach(update => {
      if (update.timestamp && new Date(update.timestamp).getTime() > Date.now() - 5000) {
        if (update.type === 'purchase') {
          addToast({
            type: 'success',
            title: 'Credits Added!',
            description: `+${update.amount} credits purchased`,
            duration: 6000
          })
        } else if (update.type === 'usage' && update.amount < 0) {
          addToast({
            type: 'info',
            title: 'Credits Used',
            description: `${Math.abs(update.amount)} credits used`,
            duration: 3000
          })
        }
      }
    })
  }, [creditUpdates, addToast])

  // Show toasts for discovery results
  useEffect(() => {
    discoveryResults.forEach(result => {
      if (result.timestamp && new Date(result.timestamp).getTime() > Date.now() - 5000) {
        addToast({
          type: 'success',
          title: 'New Channels Discovered!',
          description: `Found ${result.channel_count} channels via ${result.discovery_method}`,
          duration: 6000,
          action: {
            label: 'View Channels',
            onClick: () => window.location.href = '/dashboard/channels'
          }
        })
      }
    })
  }, [discoveryResults, addToast])

  const getJobIcon = (jobType: string) => {
    if (jobType.includes('discovery')) return Search
    if (jobType.includes('metadata')) return Database
    if (jobType.includes('video')) return Users
    if (jobType.includes('batch')) return TrendingUp
    return Database
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'failed': return 'text-red-600 dark:text-red-400'
      case 'running': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const formatJobType = (jobType: string) => {
    return jobType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const totalNotifications = jobUpdates.length + completedJobs.length + creditUpdates.length + discoveryResults.length
  const hasNewNotifications = totalNotifications > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {/* Connection Status Indicator */}
          <div className={cn(
            "absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
            connected ? "bg-green-500" : "bg-red-500"
          )} />
          {/* Notification Badge */}
          {hasNewNotifications && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-xs text-slate-500">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {!hasNewNotifications ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {/* Running Jobs */}
            {jobUpdates.filter(job => job.status === 'running').map(job => {
              const JobIcon = getJobIcon(job.job_type || '')
              return (
                <DropdownMenuItem key={job.job_id} className="flex items-start space-x-3 p-3">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <JobIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <Loader2 className="w-3 h-3 animate-spin absolute -bottom-1 -right-1 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {formatJobType(job.job_type || 'Processing')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {job.progress ? `${Math.round(job.progress)}% complete` : 'In progress...'}
                    </p>
                    {job.progress && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}

            {/* Completed Jobs */}
            {completedJobs.slice(0, 5).map(job => {
              const JobIcon = getJobIcon(job.job_type)
              return (
                <DropdownMenuItem key={`${job.job_id}-${job.timestamp}`} className="flex items-start space-x-3 p-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatJobType(job.job_type)} Completed
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {job.total_items ? `Processed ${job.total_items} items` : job.message}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(job.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              )
            })}

            {/* Credit Updates */}
            {creditUpdates.slice(0, 3).map((update, index) => (
              <DropdownMenuItem key={`credit-${update.timestamp}-${index}`} className="flex items-start space-x-3 p-3">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Credits {update.type === 'purchase' ? 'Added' : 'Used'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {update.amount > 0 ? '+' : ''}{update.amount} credits
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Balance: {update.new_balance}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}

            {/* Discovery Results */}
            {discoveryResults.slice(0, 3).map((result, index) => (
              <DropdownMenuItem key={`discovery-${result.timestamp}-${index}`} className="flex items-start space-x-3 p-3">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    New Channels Found
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {result.channel_count} via {result.discovery_method}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {hasNewNotifications && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearJobUpdates}
                className="flex-1 text-xs"
              >
                Clear Job Updates
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCompletedJobs}
                className="flex-1 text-xs"
              >
                Clear Completed
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}