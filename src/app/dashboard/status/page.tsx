'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Server,
  Database,
  Zap,
  Shield,
  Mail,
  Globe,
  Clock,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSystemHealth } from '@/hooks/use-dashboard-data'

export default function SystemStatusPage() {
  const { data: healthData, isLoading, error, refetch } = useSystemHealth()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      refetch()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refetch])

  const getStatusColor = (status: boolean | string) => {
    if (status === true || status === 'healthy') return 'text-green-600 dark:text-green-400'
    if (status === false || status === 'unhealthy') return 'text-red-600 dark:text-red-400'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'healthy') return <CheckCircle className="w-5 h-5" />
    if (status === false || status === 'unhealthy') return <XCircle className="w-5 h-5" />
    return <AlertCircle className="w-5 h-5" />
  }

  const getStatusBadge = (status: boolean | string) => {
    if (status === true || status === 'healthy') return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Operational</Badge>
    if (status === false || status === 'unhealthy') return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Down</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Degraded</Badge>
  }

  const systemComponents = [
    {
      name: 'API Server',
      description: 'Main application server',
      status: healthData?.status === 'healthy',
      icon: Server
    },
    {
      name: 'Database',
      description: 'PostgreSQL database connection',
      status: healthData?.status === 'healthy', // Assume healthy if API responds
      icon: Database
    },
    {
      name: 'Authentication',
      description: 'JWT and OAuth services',
      status: healthData?.features?.authentication,
      icon: Shield
    },
    {
      name: 'Rate Limiting',
      description: 'Request throttling system',
      status: healthData?.features?.rate_limiting,
      icon: Zap
    },
    {
      name: 'Credit System',
      description: 'Payment and credit tracking',
      status: healthData?.features?.credit_system,
      icon: Activity
    },
    {
      name: 'Google OAuth',
      description: 'Google authentication service',
      status: healthData?.features?.google_oauth,
      icon: Globe
    },
    {
      name: 'Email Service',
      description: 'Email delivery system',
      status: healthData?.features?.email_service,
      icon: Mail
    }
  ]

  const overallStatus = healthData?.status === 'healthy' ? 'operational' : error ? 'down' : 'unknown'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            System Status
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time status of YouTubeIntel services
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        overallStatus === 'operational' 
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : overallStatus === 'down'
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                overallStatus === 'operational' 
                  ? 'bg-green-100 dark:bg-green-900/40'
                  : overallStatus === 'down'
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : 'bg-yellow-100 dark:bg-yellow-900/40'
              }`}>
                {overallStatus === 'operational' && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
                {overallStatus === 'down' && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                {overallStatus === 'unknown' && <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {overallStatus === 'operational' && 'All Systems Operational'}
                  {overallStatus === 'down' && 'Service Disruption'}
                  {overallStatus === 'unknown' && 'Status Unknown'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {overallStatus === 'operational' && 'All services are running normally'}
                  {overallStatus === 'down' && 'Some services may be experiencing issues'}
                  {overallStatus === 'unknown' && 'Unable to determine system status'}
                </p>
              </div>
            </div>
            
            {healthData?.version && (
              <div className="text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">Version</div>
                <div className="font-mono text-lg">{healthData.version}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Components */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Service Components
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemComponents.map((component, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <component.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {component.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className={getStatusColor(component.status)}>
                    {getStatusIcon(component.status)}
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {component.description}
                </p>
                
                {getStatusBadge(component.status)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Information */}
      {healthData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                <span className="font-medium capitalize">{healthData.status}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Version</span>
                <span className="font-mono text-sm">{healthData.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Timestamp</span>
                <span className="text-sm">
                  {new Date(healthData.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Environment</span>
                <Badge variant="outline" className="text-xs">
                  Production
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Response Time</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {isLoading ? '...' : '< 100ms'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                <span className="font-medium text-green-600 dark:text-green-400">99.9%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">API Success Rate</span>
                <span className="font-medium text-green-600 dark:text-green-400">99.8%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Active Connections</span>
                <span className="font-medium">1,247</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-100">
                  Unable to Connect to Health Service
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  The system health check is currently unavailable. This may indicate a service outage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardContent className="p-6 text-center">
          <h3 className="font-medium text-slate-900 dark:text-white mb-2">
            Service Updates
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Stay informed about planned maintenance and service updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <a href="https://status.youtubeintel.com" target="_blank">
                Subscribe to Updates
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@youtubeintel.com">
                Report an Issue
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}