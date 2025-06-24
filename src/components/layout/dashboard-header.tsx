'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Menu, 
  Bell, 
  Search, 
  CreditCard,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuthStore } from '@/stores/auth-store'
import { useCurrentUser } from '@/hooks/use-dashboard-data'
import { useConnectionStatus, useJobUpdates, useCreditUpdates } from '@/components/websocket-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
  const { user: authUser, signout, setUser } = useAuthStore()
  const { data: userData, refetch } = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [userKey, setUserKey] = useState(0) // Force re-render key

  // WebSocket status and notifications
  const { connected, connectionStatus, reconnectAttempts, maxReconnectAttempts } = useConnectionStatus()
  const { jobUpdates } = useJobUpdates()
  const creditUpdates = useCreditUpdates()
  
  const pageTitle = pageTitles[pathname] || 'Dashboard'
  
  // Always use the freshest user data available
  const currentUser = userData?.user || authUser

  // Listen for profile picture updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.user) {
        setUser(event.detail.user)
        setUserKey(prev => prev + 1)
        refetch()
      }
    }

    const handleStorageChange = () => {
      refetch()
      setUserKey(prev => prev + 1)
    }
    
    window.addEventListener('profilePictureUpdated', handleProfileUpdate as EventListener)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [setUser, refetch])

  // Auto-refresh user data every 10 seconds to catch updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [refetch])

  const handleSignOut = async () => {
    try {
      await signout()
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/auth/signin')
    }
  }

  // Handler to display websockets connection status
  const getConnectionStatusDisplay = () => {
    if (connected) {
      return {
        icon: <Circle className="w-3 h-3 fill-green-500 text-green-500" />,
        text: 'Connected',
        color: 'text-green-600'
      }
    } else if (reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) {
      return {
        icon: <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500 animate-pulse" />,
        text: `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`,
        color: 'text-yellow-600'
      }
    } else {
      return {
        icon: <Circle className="w-3 h-3 fill-red-500 text-red-500" />,
        text: 'Disconnected',
        color: 'text-red-600'
      }
    }
  }

  const connectionDisplay = getConnectionStatusDisplay()

  // Calculate number of active jobs
  const activeJobs = Array.isArray(jobUpdates)
    ? jobUpdates.filter((job: any) => job.status === 'running' || job.status === 'processing').length
    : 0;

  // Calculate number of recent updates
  const recentUpdates =
    (Array.isArray(jobUpdates) ? jobUpdates.filter((job: any) => job.status === 'completed' && !job.seen).length : 0) +
    (Array.isArray(creditUpdates) ? creditUpdates.filter((credit: any) => !credit.seen).length : 0);

  // Get profile picture URL with fallback
  const getProfilePictureUrl = () => {
    let url = currentUser?.profile_picture
    
    // Fix Google profile picture URLs by removing size restrictions
    if (url && url.includes('googleusercontent.com')) {
      url = url.replace(/=s\d+-c$/, '=s400-c')
    }
    
    return url || null
  }

  // Get user initials for fallback
  const getUserInitials = () => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase()
    }
    if (currentUser?.first_name) {
      return currentUser.first_name[0].toUpperCase()
    }
    if (currentUser?.display_name) {
      return currentUser.display_name[0].toUpperCase()
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase()
    }
    return 'U'
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (currentUser?.display_name) return currentUser.display_name
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`
    }
    if (currentUser?.first_name) return currentUser.first_name
    return currentUser?.email || 'User'
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {pageTitle}
              </h1>

              {/* WebSocket Connection Status */}
              <div className="flex items-center space-x-1 mt-0.5">
                {connectionDisplay.icon}
                <span className={cn("text-xs", connectionDisplay.color)}>
                  {connectionDisplay.text}
                </span>
                {activeJobs > 0 && (
                  <>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-blue-600">
                      {activeJobs} job{activeJobs !== 1 ? 's' : ''} running
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
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
            {/* Credits display */}
            <Link href="/dashboard/credits">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <CreditCard className="h-4 w-4 mr-2" />
                {currentUser?.credits_balance || 0} credits
              </Button>
              <Button variant="outline" size="sm" className="sm:hidden">
                {currentUser?.credits_balance || 0}
              </Button>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {recentUpdates > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {recentUpdates}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Theme toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User menu */}
            <DropdownMenu key={`user-menu-${userKey}-${currentUser?.profile_picture}`}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                    {getProfilePictureUrl() ? (
                      <Image 
                        width={32}
                        height={32}
                        src={getProfilePictureUrl()!} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        key={`profile-img-${userKey}-${currentUser?.profile_picture}`}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement
                          const parent = target.parentElement
                          if (parent) {
                            target.style.display = 'none'
                            parent.innerHTML = getUserInitials()
                          }
                        }}
                      />
                    ) : (
                      getUserInitials()
                    )}
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
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
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