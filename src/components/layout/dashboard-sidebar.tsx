'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useCurrentUser } from '@/hooks/use-dashboard-data'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Search, 
  Database, 
  CreditCard, 
  Settings, 
  Play,
  Home,
  TrendingUp,
  Users,
  FileText,
  LogOut,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Discover', href: '/dashboard/discover', icon: Search },
  { name: 'Channels', href: '/dashboard/channels', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Database },
  { name: 'Credits', href: '/dashboard/credits', icon: CreditCard },
]

const secondaryNavigation = [
  { name: 'Status', href: '/dashboard/status', icon: TrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Documentation', href: '/docs', icon: FileText },
]

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user: authUser, signout, setUser } = useAuthStore()
  const { data: userData, refetch } = useCurrentUser()
  const router = useRouter()
  const [userKey, setUserKey] = useState(0) // Force re-render key

  // Use the most up-to-date user data
  const user = userData?.user || authUser

  // Listen for profile picture updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('Sidebar received profile update event:', event.detail)
      if (event.detail?.user) {
        setUser(event.detail.user)
        setUserKey(prev => prev + 1) // Force re-render
      }
    }

    window.addEventListener('profilePictureUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate as EventListener)
    }
  }, [setUser])

  const handleSignOut = async () => {
    try {
      await signout()
      // Clear any remaining data
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      onClose()
      router.push('/')
    } catch (error) {
      console.error('Signout error:', error)
      // Force cleanup even if API fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      onClose()
      router.push('/')
    }
  }

  // Get profile picture URL with fallback
  const getProfilePictureUrl = () => {
    let url = user?.profile_picture
    
    // Fix Google profile picture URLs by removing size restrictions
    if (url && url.includes('googleusercontent.com')) {
      url = url.replace(/=s\d+-c$/, '=s400-c')
    }
    
    console.log('Sidebar getting profile picture URL:', url, 'for user:', user?.email)
    return url || null
  }

  // Get user initials for fallback
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase()
    }
    if (user?.display_name) {
      return user.display_name[0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.display_name) return user.display_name
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.first_name) return user.first_name
    return user?.email || 'User'
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent 
          navigation={navigation}
          secondaryNavigation={secondaryNavigation}
          pathname={pathname}
          user={user}
          userKey={userKey}
          getProfilePictureUrl={getProfilePictureUrl}
          getUserInitials={getUserInitials}
          getUserDisplayName={getUserDisplayName}
          onSignOut={handleSignOut}
          onClose={onClose}
          showCloseButton
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        <div className="h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          <SidebarContent 
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
            pathname={pathname}
            user={user}
            userKey={userKey}
            getProfilePictureUrl={getProfilePictureUrl}
            getUserInitials={getUserInitials}
            getUserDisplayName={getUserDisplayName}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </>
  )
}

interface SidebarContentProps {
  navigation: Array<{ name: string; href: string; icon: any }>
  secondaryNavigation: Array<{ name: string; href: string; icon: any }>
  pathname: string
  user: any
  userKey: number
  getProfilePictureUrl: () => string | null
  getUserInitials: () => string
  getUserDisplayName: () => string
  onSignOut: () => void
  onClose?: () => void
  showCloseButton?: boolean
}

function SidebarContent({ 
  navigation, 
  secondaryNavigation, 
  pathname, 
  user, 
  userKey,
  getProfilePictureUrl,
  getUserInitials,
  getUserDisplayName,
  onSignOut, 
  onClose,
  showCloseButton 
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YouTubeIntel
          </span>
        </Link>
        
        {showCloseButton && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden"
            key={`sidebar-avatar-${userKey}-${user?.profile_picture}`} // Force re-render when profile changes
          >
            {getProfilePictureUrl() ? (
              <Image
                width={32}
                height={32}
                key={`sidebar-profile-pic-${userKey}-${user?.profile_picture}`} 
                src={getProfilePictureUrl()!} 
                alt="Profile" 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={() => console.log('Sidebar profile image loaded:', getProfilePictureUrl())}
                onError={(e) => {
                  console.log('Sidebar profile image failed to load, falling back to initials')
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
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.credits_balance || 0} credits
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )}
              />
              {item.name}
              
              {/* Badge for active jobs on Jobs page */}
              {item.name === 'Jobs' && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
                  2
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
          
          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}