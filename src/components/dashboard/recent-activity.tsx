import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Users, Video, Calendar } from 'lucide-react'

const activities = [
  { id: 1, type: 'discovery', message: 'Discovered 23 new channels in Tech category', time: '2 min ago', icon: Users },
  { id: 2, type: 'analysis', message: 'Completed analysis for MrBeast channel', time: '5 min ago', icon: Video },
  { id: 3, type: 'export', message: 'Exported 150 channels to CSV', time: '10 min ago', icon: Calendar },
  { id: 4, type: 'credit', message: 'Purchased 500 credits', time: '1 hour ago', icon: CheckCircle }
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <activity.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
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
      </CardContent>
    </Card>
  )
}