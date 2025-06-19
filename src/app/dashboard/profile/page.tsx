'use client'

import { useEffect, useState } from 'react'
import { 
  User, 
  Camera, 
  Mail, 
  Calendar,
  Link as LinkIcon,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useCurrentUser, useUpdateProfile } from '@/hooks/use-dashboard-data'

export default function ProfilePage() {
  const { data: userData, isLoading } = useCurrentUser()
  const updateProfile = useUpdateProfile()
  
  const user = userData?.user

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || ''
  })

  // Form states
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Update form data when user data loads
  useEffect(() => {
    let isMounted = true;
    if (user && isMounted) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || ''
      })
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async () => {
    setError('')
    setSuccess(false)

    try {
      await updateProfile.mutateAsync(formData)
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
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-600 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {user?.full_name || user?.email}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={user?.email_verified ? "success" : "warning"}>
                      {user?.email_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                    <Badge variant="info" className="capitalize">
                      {user?.current_plan || 'Free'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className="mt-2 text-slate-900 dark:text-white">
                        {user?.first_name || 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className="mt-2 text-slate-900 dark:text-white">
                        {user?.last_name || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  {isEditing ? (
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      placeholder="How would you like to be addressed?"
                    />
                  ) : (
                    <div className="mt-2 text-slate-900 dark:text-white">
                      {user?.display_name || 'Not set'}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    This is how your name will appear in the dashboard
                  </p>
                </div>

                <div>
                  <Label>Email Address</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-white">{user?.email}</span>
                    {user?.email_verified && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div>
                  <Label>Authentication Method</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-white capitalize">
                      {user?.auth_method === 'google' ? 'Google OAuth' : 'Email & Password'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Account Stats */}
        <div className="space-y-6">
          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Member since</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(user?.created_at || '').toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Credits balance</span>
                <span className="text-sm font-medium">{user?.credits_balance || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total purchased</span>
                <span className="text-sm font-medium">{user?.total_credits_purchased || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Current plan</span>
                <Badge variant="info" className="capitalize">
                  {user?.current_plan || 'Free'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Last login</span>
                <span className="text-sm font-medium">
                  {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Summary</CardTitle>
              <CardDescription>Your recent platform usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Activity tracking will be available with WebSocket integration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/dashboard/settings'}
              >
                <User className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/dashboard/credits'}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Manage Credits
              </Button>
              
              {!user?.email_verified && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Verify Email
                </Button>
              )}
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
        </div>
      </div>
    </div>
  )
}