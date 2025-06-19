'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Menu, 
  Bell, 
  Search, 
  CreditCard,
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuthStore } from '@/stores/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

// Page title mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/discover': 'Discover Channels',
  '/dashboard/channels': 'My Channels',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/jobs': 'Processing Jobs',
  '/dashboard/credits': 'Credits & Billing',
  '/dashboard/settings': 'Settings',
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const pageTitle = pageTitles[pathname] || 'Dashboard'

  const handleSignOut = async () => {
    try {
      await signout()
      // Clear any remaining data
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/')
    } catch (error) {
      console.error('Signout error:', error)
      // Force cleanup even if API fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/')
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search channels, videos, or jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Credits display (mobile-friendly) */}
            <Link href="/dashboard/credits">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <CreditCard className="h-4 w-4 mr-2" />
                {user?.credits_balance || 0} credits
              </Button>
              <Button variant="outline" size="sm" className="sm:hidden">
                {user?.credits_balance || 0}
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                2
              </Badge>
            </Button>

            {/* Theme toggle (hidden on mobile) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/credits" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credits & Billing
                  </Link>
                </DropdownMenuItem>
                
                {/* Theme toggle for mobile */}
                <div className="sm:hidden">
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
        </div>
      </div>
    </header>
  )
}