import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'

export function useProfilePictureListener() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    // Listen for profile picture changes in the query cache
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.includes('current-user') && event.type === 'updated') {
        const updatedData = event.query.state.data as any
        if (updatedData?.user && updatedData.user !== user) {
          console.log('Profile picture listener detected user update:', updatedData.user)
          setUser(updatedData.user)
          
          // Force a re-render by invalidating other queries
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] })
          }, 100)
        }
      }
    })

    return () => unsubscribe()
  }, [queryClient, user, setUser])

  // Also create a manual refresh function
  const refreshUserData = async () => {
    console.log('Manually refreshing user data...')
    await queryClient.refetchQueries({ queryKey: ['current-user'] })
    await queryClient.refetchQueries({ queryKey: ['user-profile'] })
  }

  return { refreshUserData }
}