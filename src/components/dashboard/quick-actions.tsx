import Link from 'next/link'
import { 
  Search, 
  BarChart3, 
  Upload, 
  Download,
  Zap,
  Users,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
  {
    title: 'Discover Channels',
    description: 'Find new channels in your niche',
    icon: Search,
    href: '/dashboard/discover',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    title: 'Batch Analysis',
    description: 'Analyze multiple channels at once',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    title: 'Import Channels',
    description: 'Upload your channel list',
    icon: Upload,
    href: '/dashboard/import',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
  {
    title: 'Export Data',
    description: 'Download your discoveries',
    icon: Download,
    href: '/dashboard/export',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  },
  {
    title: 'Buy Credits',
    description: 'Top up your account',
    icon: Zap,
    href: '/dashboard/credits',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600'
  },
  {
    title: 'Manage Channels',
    description: 'Organize your channel list',
    icon: Users,
    href: '/dashboard/channels',
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600'
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quick Actions</span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="group p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md hover:scale-105">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${action.color} ${action.hoverColor} rounded-lg flex items-center justify-center transition-colors`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="sm:hidden">
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-2 px-2">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href} className="flex-shrink-0">
                <div className="w-32 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-sm text-slate-900 dark:text-white mb-1 truncate">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}