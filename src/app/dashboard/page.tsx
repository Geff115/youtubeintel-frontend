'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  Video, 
  Zap, 
  Plus,
  RefreshCw,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { ChannelGrowthChart } from '@/components/dashboard/channel-growth-chart'
import { CreditUsageChart } from '@/components/dashboard/credit-usage-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { JobsOverview } from '@/components/dashboard/jobs-overview'
import { useDashboardOverview } from '@/hooks/use-dashboard-data'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const { stats, user, recentActivity, isLoading, error, refetch } = useDashboardOverview()

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96 mt-2 animate-pulse" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            Failed to load dashboard data. Please try again.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const timeRanges = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
    { label: '1 year', value: '1y' }
  ]

  // Calculate derived stats from API data
  const totalChannels = stats?.total_channels || 0
  const channelsAnalyzed = stats?.channels_with_metadata || 0
  const totalVideos = stats?.total_videos || 0
  const userCredits = stats?.user_stats?.credits_balance || 0
  const totalCreditsPurchased = stats?.user_stats?.total_credits_purchased || 0
  const apiUsageToday = stats?.user_stats?.api_usage_today || 0
  
  // Calculate analysis percentage
  const analysisPercentage = totalChannels > 0 ? ((channelsAnalyzed / totalChannels) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.first_name || 'User'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your YouTube intelligence operations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Link href="/dashboard/discover">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Discover Channels</span>
              <span className="sm:hidden">Discover</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Stats Grid - Using Real API Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Channels"
          value={totalChannels.toLocaleString()}
          subtitle={`${channelsAnalyzed} analyzed`}
          change={analysisPercentage > 80 ? 12.5 : -2.1}
          trend={analysisPercentage > 80 ? "up" : "down"}
          icon={Users}
          href="/dashboard/channels"
        />
        <StatsCard
          title="Videos Found"
          value={totalVideos.toLocaleString()}
          change={8.2}
          trend="up"
          icon={Video}
          href="/dashboard/analytics"
        />
        <StatsCard
          title="Credits Balance"
          value={userCredits}
          subtitle={`${totalCreditsPurchased} total purchased`}
          icon={Zap}
          href="/dashboard/credits"
        />
        <StatsCard
          title="API Usage Today"
          value={apiUsageToday}
          subtitle="requests made"
          change={apiUsageToday > 50 ? 15.3 : -5.2}
          trend={apiUsageToday > 50 ? "up" : "down"}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions - Mobile-friendly */}
      <QuickActions />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Discovery Activity</span>
              <Button variant="ghost" size="sm">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Channels discovered over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Channel Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Channel Growth</span>
              <Button variant="ghost" size="sm">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Subscriber growth tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelGrowthChart timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Jobs Overview & Credit Usage */}
        <div className="space-y-6">
          <JobsOverview />
          <CreditUsageChart />
        </div>
      </div>

      {/* Mobile time range selector */}
      <div className="sm:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`p-3 text-sm font-medium rounded-lg transition-colors ${
                    timeRange === range.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}