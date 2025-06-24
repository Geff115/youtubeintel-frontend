'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { 
  User, 
  Camera, 
  Mail, 
  Link as LinkIcon,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Upload,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  useCurrentUser, 
  useUpdateProfile,
  useUploadProfilePicture,
  useDeleteProfilePicture
} from '@/hooks/use-dashboard-data'
import { useAuthStore } from '@/stores/auth-store'

export default function ProfilePage() {
  const { data: userData, isLoading, refetch } = useCurrentUser()
  const updateProfile = useUpdateProfile()
  const uploadProfilePicture = useUploadProfilePicture()
  const deleteProfilePicture = useDeleteProfilePicture()
  const { user: authUser, setUser } = useAuthStore()
  
  const user = userData?.user || authUser

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: ''
  })

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')

  // Form states
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || ''
      })
    }
  }, [user])

  // Handle profile picture selection
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      
      setProfilePicture(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear any previous errors
      setError('')
    }
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return

    try {
      setError('')

      const formData = new FormData()
      formData.append('profile_picture', profilePicture)

      console.log('Profile page: Uploading profile picture...')
      const result = await uploadProfilePicture.mutateAsync(formData)
      
      console.log('Profile page: Upload successful:', result)
      setSuccess(true)
      setProfilePicture(null)
      setProfilePicturePreview('')
      
      // Update auth store immediately
      if (result.user) {
        setUser(result.user)
        
        // Dispatch custom event to notify header and sidebar
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
          detail: { user: result.user } 
        }))
        
        console.log('Profile page: Dispatched profilePictureUpdated event')
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error: any) {
      console.error('Profile page: Profile picture upload error:', error)
      setError(error.response?.data?.error || 'Failed to upload profile picture')
    }
  }

  // Handle profile picture deletion
  const handleProfilePictureDelete = async () => {
    if (!user?.profile_picture) return

    try {
      setError('')

      console.log('Profile page: Deleting profile picture...')
      const result = await deleteProfilePicture.mutateAsync()
      
      console.log('Profile page: Delete successful:', result)
      setSuccess(true)
      
      // Update auth store immediately
      if (result.user) {
        setUser(result.user)
        
        // Dispatch custom event to notify header and sidebar
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
          detail: { user: result.user } 
        }))
        
        console.log('Profile page: Dispatched profilePictureUpdated event after deletion')
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error: any) {
      console.error('Profile page: Profile picture delete error:', error)
      setError(error.response?.data?.error || 'Failed to delete profile picture')
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess(false)

    try {
      const result = await updateProfile.mutateAsync(formData)
      
      // Update auth store
      if (result.user) {
        setUser(result.user)
      }
      
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || ''
      })
    }
    setIsEditing(false)
    setError('')
    setProfilePicture(null)
    setProfilePicturePreview('')
  }

  // Get profile picture URL with fallback
  const getProfilePictureUrl = () => {
    if (profilePicturePreview) return profilePicturePreview
    if (user?.profile_picture) return user.profile_picture
    return null
  }

  // Get user initials for fallback
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal information and public profile
          </p>
        </div>
        
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfile.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {getProfilePictureUrl() ? (
                      <Image
                        width={80}
                        height={80}
                        src={getProfilePictureUrl()!} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Profile Picture
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Upload a photo to personalize your profile
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    
                    {/* Upload button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const fileInput = document.getElementById('profile-picture-upload') as HTMLInputElement
                        fileInput?.click()
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                    
                    {profilePicture && (
                      <Button
                        onClick={handleProfilePictureUpload}
                        disabled={uploadProfilePicture.isPending}
                        size="sm"
                      >
                        {uploadProfilePicture.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                    
                    {user?.profile_picture && !profilePicture && (
                      <Button
                        onClick={handleProfilePictureDelete}
                        disabled={deleteProfilePicture.isPending}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deleteProfilePicture.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Removing...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-900 dark:text-white">{user?.display_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-900 dark:text-white">{user?.last_name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-900 dark:text-white">{user?.email}</p>
                      {user?.email_verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
                <Badge variant="info">{user?.current_plan || 'Free'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Credits</span>
                <span className="font-medium">{user?.credits_balance || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Member since</span>
                <span className="text-sm">{new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Authentication</span>
                <Badge variant={user?.auth_method === 'google' ? 'info' : 'outline'}>
                  {user?.auth_method === 'google' ? 'Google' : 'Email'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Email verified</span>
                {user?.email_verified ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/settings">
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/credits">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Credits
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/docs">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Documentation
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic Info</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verification</span>
                  {user?.email_verified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Display Name</span>
                  {user?.display_name ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                  )}
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Completion</span>
                    <span>
                      {Math.round(
                        ((user?.email_verified ? 1 : 0) + 
                         (user?.display_name ? 1 : 0) + 1) / 3 * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round(
                          ((user?.email_verified ? 1 : 0) + 
                           (user?.display_name ? 1 : 0) + 1) / 3 * 100
                        )}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-xs text-slate-500">Just now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last login</p>
                    <p className="text-xs text-slate-500">
                      {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Account created</p>
                    <p className="text-xs text-slate-500">
                      {new Date(user?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}