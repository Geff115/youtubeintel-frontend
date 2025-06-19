import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useJobs } from '@/hooks/use-dashboard-data'

export function JobsOverview() {
  const { data: jobs, isLoading, error } = useJobs(undefined, 5) // Get latest 5 jobs

  const activeJobs = jobs?.filter((job: { status: string }) => job.status === 'running' || job.status === 'pending') || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Processing Jobs</span>
          <Badge variant={activeJobs.length > 0 ? "info" : "secondary"}>
            {activeJobs.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Failed to load jobs</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job: any) => {
              const progress = job.total_items ? 
                Math.round((job.processed_items / job.total_items) * 100) : 
                (job.status === 'completed' ? 100 : 0)
              
              return (
                <div key={job.job_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {job.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                      {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {job.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
                      {job.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span className="text-sm font-medium truncate">
                        {job.job_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        {job.status === 'running' && job.total_items && `${job.processed_items}/${job.total_items}`}
                        {job.status === 'completed' && 'Done'}
                        {job.status === 'pending' && 'Waiting'}
                        {job.status === 'failed' && 'Error'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        job.status === 'completed' ? 'bg-green-600' :
                        job.status === 'running' ? 'bg-blue-600' :
                        job.status === 'failed' ? 'bg-red-600' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No recent jobs</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Jobs will appear here when you start processing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}