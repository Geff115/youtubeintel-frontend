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
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useCurrentUser, useUpdateProfile, useChangePassword, useUserSessions, useRevokeSession } from '@/hooks/use-dashboard-data'
import { useAuthStore } from '@/stores/auth-store'

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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // This would require implementing delete account API
      alert('Account deletion is not implemented yet. Please contact support.')
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
              <CardTitle className="flex items-center text-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}