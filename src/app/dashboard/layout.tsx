'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useAuthProvider } from '@/hooks/use-auth-provider'
import { WebSocketProvider } from '@/components/websocket-provider'
import { RealtimeNotifications } from '@/components/realtime-notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

// Create QueryClient outside of component to avoid recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false
        }
        return failureCount < 3
      }
    }
  }
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoading, isAuthenticated } = useAuthProvider()

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Desktop Sidebar */}
          <DashboardSidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="lg:pl-64">
            {/* Header */}
            <DashboardHeader 
              onMenuClick={() => setSidebarOpen(true)}
            />
            
            {/* Page Content */}
            <main className="pb-20 lg:pb-6">
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
          
          {/* Real-time Notifications - Only show when authenticated */}
          <RealtimeNotifications />
        </div>
      </WebSocketProvider>
    </QueryClientProvider>
  )
}