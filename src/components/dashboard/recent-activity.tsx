import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Users, AlertCircle, Loader2, Clock } from 'lucide-react'
import { useRecentActivity } from '@/hooks/use-dashboard-data'

export function RecentActivity() {
  const { data: activities, isLoading, error } = useRecentActivity()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">Failed to load recent activity</p>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                  activity.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  activity.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' :
                  'bg-slate-100 dark:bg-slate-700'
                }`}>
                  {activity.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  {activity.status === 'running' && <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />}
                  {activity.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  {activity.status === 'pending' && <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Start discovering channels to see activity here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}