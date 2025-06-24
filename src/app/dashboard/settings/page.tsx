'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Lock, 
  Smartphone, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Camera,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  useCurrentUser, 
  useUpdateProfile, 
  useChangePassword, 
  useUserSessions, 
  useRevokeSession,
  useUploadProfilePicture,
  useDeleteProfilePicture
} from '@/hooks/use-dashboard-data'
import { useAuthStore } from '@/stores/auth-store'
import { userAPI } from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const { data: userData, isLoading, refetch: refetchUser } = useCurrentUser()
  const { data: sessions } = useUserSessions()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const revokeSession = useRevokeSession()
  const uploadProfilePicture = useUploadProfilePicture()
  const deleteProfilePicture = useDeleteProfilePicture()
  const { signout, user: authUser, setUser } = useAuthStore()

  const user = userData?.user || authUser
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile form state - Initialize properly with useEffect
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    display_name: ''
  })

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || ''
      })
    }
  }, [user])

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')

  // Form states
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  // Deletion states
  type DeletionEligibility = {
    can_delete: boolean
    user: {
      email: string
      credits_balance: number
      account_age_days: number
      total_credits_purchased: number
    }
    blockers: { message: string; action: string }[]
    warnings: { message: string; action: string }[]
    support_contact: string
    data_to_be_deleted: string[]
  }
  const [deletionEligibility, setDeletionEligibility] = useState<DeletionEligibility | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [deletionError, setDeletionError] = useState('')

  // Handle profile picture selection
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setProfileError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Image must be less than 5MB')
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
      setProfileError('')
    }
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return

    try {
      setProfileError('')

      const formData = new FormData()
      formData.append('profile_picture', profilePicture)

      console.log('Uploading profile picture...')
      const result = await uploadProfilePicture.mutateAsync(formData)
      
      console.log('Upload successful:', result)
      setProfileSuccess(true)
      setProfilePicture(null)
      setProfilePicturePreview('')
      
      // Update auth store immediately
      if (result.user) {
        setUser(result.user)
        
        // Dispatch custom event to notify header and other components
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
          detail: { user: result.user } 
        }))
        
        console.log('Dispatched profilePictureUpdated event with user:', result.user)
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000)
      
      console.log('Profile picture upload completed successfully')
      
    } catch (error: any) {
      console.error('Profile picture upload error:', error)
      setProfileError(error.response?.data?.error || 'Failed to upload profile picture')
    }
  }

  // Handle profile picture deletion
  const handleProfilePictureDelete = async () => {
    if (!user?.profile_picture) return

    try {
      setProfileError('')

      console.log('Deleting profile picture...')
      const result = await deleteProfilePicture.mutateAsync()
      
      console.log('Delete successful:', result)
      setProfileSuccess(true)
      
      // Update auth store immediately
      if (result.user) {
        setUser(result.user)
        
        // Dispatch custom event to notify header and other components
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
          detail: { user: result.user } 
        }))
        
        console.log('Dispatched profilePictureUpdated event after deletion with user:', result.user)
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000)
      
      console.log('Profile picture deletion completed successfully')
      
    } catch (error: any) {
      console.error('Profile picture delete error:', error)
      setProfileError(error.response?.data?.error || 'Failed to delete profile picture')
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    setProfileError('')
    setProfileSuccess(false)

    try {
      await updateProfile.mutateAsync(profileForm)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error: any) {
      setProfileError(error.response?.data?.error || 'Failed to update profile')
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long')
      return
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.current_password,
        newPassword: passwordForm.new_password
      })
      setPasswordSuccess(true)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Failed to change password')
    }
  }

  // Handle session revocation
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId)
    } catch (error) {
      console.error('Failed to revoke session:', error)
    }
  }

  // Function to check deletion eligibility
  const checkDeletionEligibility = async () => {
    try {
      const response = await userAPI.checkDeletionEligibility()
      setDeletionEligibility(response)
    } catch (error: any) {
      setDeletionError(error.response?.data?.error || 'Failed to check deletion eligibility')
    }
  }

  // Function to handle data export
  const handleExportData = async () => {
    try {
      setExportLoading(true)
      const response = await userAPI.requestDataExport()
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `youtubeintel-data-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
    } catch (error: any) {
      setDeletionError(error.response?.data?.error || 'Failed to export data')
    } finally {
      setExportLoading(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletionEligibility) {
      await checkDeletionEligibility()
      return
    }

    if (!deletionEligibility.can_delete) {
      setDeletionError('Account cannot be deleted at this time. Please resolve the issues listed above.')
      return
    }

    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setDeletionError('Please type "DELETE MY ACCOUNT" to confirm deletion')
      return
    }

    try {
      setDeleteLoading(true)
      setDeletionError('')
      
      const response = await userAPI.deleteAccount()
      
      // Account deleted successfully
      alert(response.message + '\n\nYou will now be redirected to the home page.')
      
      // Sign out and redirect
      await signout()
      router.push('/')
      
    } catch (error: any) {
      setDeletionError(error.response?.data?.error || 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
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
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and display name
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileSuccess && (
                <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {profileError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Profile Picture Section */}
              <div className="mb-6">
                <Label className="text-base font-medium">Profile Picture</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden">
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
                  
                  <div className="flex flex-col space-y-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    
                    {/* Camera button that triggers file input */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        console.log('Camera button clicked clicked with ref')
                        fileInputRef.current?.click()
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                    
                    {profilePicture && (
                      <Button
                        onClick={handleProfilePictureUpload}
                        disabled={uploadProfilePicture.isPending}
                        className="w-full"
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
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deleteProfilePicture.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* Debug button to test file input */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const fileInput = document.getElementById('profile-picture-upload') as HTMLInputElement
                        console.log('File input element:', fileInput)
                        console.log('File input exists:', !!fileInput)
                        if (fileInput) {
                          console.log('Triggering file input click...')
                          fileInput.click()
                        }
                      }}
                      className="text-xs"
                    >
                      Debug: Test File Input
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: Square image, at least 200x200px, max 5MB. Supports JPG, PNG, GIF, WEBP.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      disabled={updateProfile.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      disabled={updateProfile.isPending}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm({...profileForm, display_name: e.target.value})}
                    placeholder="How you'd like to be addressed"
                    disabled={updateProfile.isPending}
                  />
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input value={user?.email || ''} disabled className="bg-slate-50 dark:bg-slate-800" />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <Button onClick={handleProfileUpdate} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Change - Only show for email auth users */}
          {user?.auth_method === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {passwordSuccess && (
                  <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      Password changed successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {passwordError && (
                  <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-700 dark:text-red-400">
                      {passwordError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        disabled={changePassword.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                        disabled={changePassword.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                        disabled={changePassword.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button onClick={handlePasswordChange} disabled={changePassword.isPending}>
                    {changePassword.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - keeping the rest of your sidebar content */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Credits</span>
                <span className="font-medium">{user?.credits_balance || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Member since</span>
                <span className="text-sm">{new Date(user?.created_at || '').toLocaleDateString()}</span>
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

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Smartphone className="w-5 h-5 mr-2" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions?.sessions?.length > 0 ? (
                <div className="space-y-3">
                  {sessions.sessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{session.device_info || 'Unknown Device'}</p>
                        <p className="text-xs text-slate-500">
                          {session.ip_address} • {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokeSession.isPending}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active sessions found</p>
              )}
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!deletionEligibility && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Before you can delete your account, we need to check if your account is eligible for deletion.
                  </p>
                  <Button 
                    onClick={checkDeletionEligibility}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    Check Deletion Eligibility
                  </Button>
                </div>
              )}

              {deletionEligibility && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Account Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Email:</span>
                        <p className="font-medium">{deletionEligibility.user.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Credits:</span>
                        <p className="font-medium">{deletionEligibility.user.credits_balance}</p>
                      </div>
                    </div>
                  </div>
                  
                  {deletionEligibility.can_delete && (
                    <Button
                      onClick={() => setShowDeleteConfirmation(true)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  )}
                </div>
              )}

              {deletionError && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mt-4">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {deletionError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                <p>
                  Need help? Contact us at{' '}
                  <a 
                    href="mailto:support@youtubeintel.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@youtubeintel.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}