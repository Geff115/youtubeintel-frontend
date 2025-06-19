'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home,
  Search, 
  BarChart3, 
  Users,
  CreditCard
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Discover', href: '/dashboard/discover', icon: Search },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Channels', href: '/dashboard/channels', icon: Users },
  { name: 'Credits', href: '/dashboard/credits', icon: CreditCard },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
      <nav className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors min-w-0 flex-1",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 mb-1",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-400 dark:text-slate-500"
                  )} 
                />
                <span className="truncate">{item.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}