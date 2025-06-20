'use client'

import { useState } from 'react'
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
  Download,
  AlertCircle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useCurrentUser, useUpdateProfile, useChangePassword, useUserSessions, useRevokeSession } from '@/hooks/use-dashboard-data'
import { useAuthStore } from '@/stores/auth-store'
import { userAPI } from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const { data: userData, isLoading } = useCurrentUser()
  const { data: sessions } = useUserSessions()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const revokeSession = useRevokeSession()
  const { signout } = useAuthStore()

  const user = userData?.user

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || ''
  })

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

  // Form states
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
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

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
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
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
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

              <form onSubmit={handleProfileUpdate} className="space-y-4">
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

                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
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

                <form onSubmit={handlePasswordChange} className="space-y-4">
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

                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Overview</CardTitle>
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

          {/* Danger Zone */}
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
              {/* Check Eligibility Button */}
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

              {/* Deletion Eligibility Results */}
              {deletionEligibility && (
                <div className="space-y-4">
                  {/* Account Information */}
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
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Account Age:</span>
                        <p className="font-medium">{deletionEligibility.user.account_age_days} days</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Total Purchased:</span>
                        <p className="font-medium">{deletionEligibility.user.total_credits_purchased} credits</p>
                      </div>
                    </div>
                  </div>

                  {/* Blockers */}
                  {deletionEligibility.blockers.length > 0 && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium text-red-700 dark:text-red-400">Cannot Delete Account:</p>
                          {deletionEligibility.blockers.map((blocker: any, index: any) => (
                            <div key={index} className="text-sm">
                              <p className="text-red-700 dark:text-red-400">{blocker.message}</p>
                              <p className="text-red-600 dark:text-red-500">{blocker.action}</p>
                            </div>
                          ))}
                          <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                            Contact: {deletionEligibility.support_contact}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Warnings */}
                  {deletionEligibility.warnings.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium text-yellow-700 dark:text-yellow-400">Important Warnings:</p>
                          {deletionEligibility.warnings.map((warning: any, index: any) => (
                            <div key={index} className="text-sm">
                              <p className="text-yellow-700 dark:text-yellow-400">{warning.message}</p>
                              <p className="text-yellow-600 dark:text-yellow-500">{warning.action}</p>
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Data Export */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">Export Your Data</h4>
                      <Button
                        onClick={handleExportData}
                        disabled={exportLoading}
                        variant="outline"
                        size="sm"
                      >
                        {exportLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Download all your account data before deletion (GDPR compliance)
                    </p>
                  </div>

                  {/* Data to be Deleted */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Data That Will Be Deleted</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {deletionEligibility.data_to_be_deleted.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deletion Section */}
                  {deletionEligibility.can_delete && (
                    <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                      <div className="space-y-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                          <h4 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h4>
                        </div>
                        
                        <div className="text-sm text-red-700 dark:text-red-400">
                          <p className="font-medium mb-2">This action cannot be undone. This will permanently:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Delete your account and profile</li>
                            <li>Remove all credit balances and transaction history</li>
                            <li>Clear all API usage logs and session data</li>
                            <li>Revoke access to all YouTubeIntel services</li>
                          </ul>
                        </div>

                        {!showDeleteConfirmation ? (
                          <Button
                            onClick={() => setShowDeleteConfirmation(true)}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete My Account
                          </Button>
                        ) : (
                          <div className="space-y-4 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-red-900/20">
                            <div>
                              <Label className="text-red-700 dark:text-red-400 font-medium">
                                Type "DELETE MY ACCOUNT" to confirm:
                              </Label>
                              <Input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="mt-2 border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                placeholder="DELETE MY ACCOUNT"
                              />
                            </div>
                            
                            <div className="flex space-x-3">
                              <Button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || deleteLoading}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteLoading ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Confirm Deletion
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                onClick={() => {
                                  setShowDeleteConfirmation(false)
                                  setDeleteConfirmText('')
                                  setDeletionError('')
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {deletionError && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mt-4">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {deletionError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Support Contact */}
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