'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  Video, 
  Zap, 
  Plus,
  ArrowUpRight,
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
import Link from 'next/link'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')

  // Mock data - will be replaced with real API calls
  const stats = {
    totalChannels: 1247,
    channelsAnalyzed: 892,
    totalVideos: 15420,
    creditsUsed: 156,
    creditsRemaining: 344,
    growthRate: 12.5,
    discoverySuccess: 87.3,
    processingJobs: 3
  }

  const timeRanges = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
    { label: '1 year', value: '1y' }
  ]

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track your YouTube intelligence operations and analytics
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
          
          <Link href="/dashboard/discover">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Discover Channels
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Channels"
          value={stats.totalChannels.toLocaleString()}
          change={stats.growthRate}
          trend="up"
          icon={Users}
          href="/dashboard/channels"
        />
        <StatsCard
          title="Videos Analyzed"
          value={stats.totalVideos.toLocaleString()}
          change={8.2}
          trend="up"
          icon={Video}
          href="/dashboard/analytics"
        />
        <StatsCard
          title="Credits Used"
          value={stats.creditsUsed}
          subtitle={`${stats.creditsRemaining} remaining`}
          icon={Zap}
          href="/dashboard/credits"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.discoverySuccess}%`}
          change={2.1}
          trend="up"
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
