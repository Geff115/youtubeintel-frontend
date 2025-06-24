import { JobMonitoring } from '@/components/job/job-monitoring'

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Processing Jobs</h1>
      <JobMonitoring showCompleted={true} limit={20} autoRefresh />
    </div>
  )
}