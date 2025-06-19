import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  href?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  trend = 'neutral',
  icon: Icon,
  href,
  className
}: StatsCardProps) {
  const content = (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md hover:scale-105",
      href && "cursor-pointer hover:border-blue-200 dark:hover:border-blue-800",
      className
    )}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
              {title}
            </p>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            {change !== undefined && (
              <div className={cn(
                "flex items-center mt-2 text-xs sm:text-sm font-medium",
                trend === 'up' && "text-green-600 dark:text-green-400",
                trend === 'down' && "text-red-600 dark:text-red-400",
                trend === 'neutral' && "text-slate-600 dark:text-slate-400"
              )}>
                {trend === 'up' && <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                {trend === 'down' && <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                {Math.abs(change)}%
                <span className="ml-1 text-slate-500 dark:text-slate-400">
                  vs last period
                </span>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <div className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center",
              trend === 'up' && "bg-green-100 dark:bg-green-900/20",
              trend === 'down' && "bg-red-100 dark:bg-red-900/20",
              trend === 'neutral' && "bg-blue-100 dark:bg-blue-900/20"
            )}>
              <Icon className={cn(
                "w-5 h-5 sm:w-6 sm:h-6",
                trend === 'up' && "text-green-600 dark:text-green-400",
                trend === 'down' && "text-red-600 dark:text-red-400",
                trend === 'neutral' && "text-blue-600 dark:text-blue-400"
              )} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}