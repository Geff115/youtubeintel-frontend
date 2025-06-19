import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, Loader2 } from 'lucide-react'

const jobs = [
  { id: 1, type: 'Channel Discovery', status: 'running', progress: 65, eta: '2 min' },
  { id: 2, type: 'Metadata Fetch', status: 'completed', progress: 100, eta: null },
  { id: 3, type: 'Video Analysis', status: 'pending', progress: 0, eta: '5 min' }
]

export function JobsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Processing Jobs</span>
          <Badge variant="info">3 active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {job.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {job.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
                <span className="text-sm font-medium truncate">{job.type}</span>
              </div>
              {job.eta && (
                <span className="text-xs text-slate-500">{job.eta}</span>
              )}
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}