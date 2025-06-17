'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/auth-store'

export function SignUpForm() {
  const router = useRouter()
  const { signup, signupWithGoogle, isLoading, error, clearError } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    age_confirmed: false,
    agreed_to_terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [signupSuccess, setSignupSuccess] = useState(false)

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/\d/.test(password)) errors.push('One number')
    return errors
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters'
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = 'Last name must be at least 2 characters'
    }
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else {
      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) {
        errors.password = `Password must have: ${passwordErrors.join(', ')}`
      }
    }
    
    if (!formData.age_confirmed) {
      errors.age_confirmed = 'You must confirm that you are 18 years or older'
    }
    
    if (!formData.agreed_to_terms) {
      errors.agreed_to_terms = 'You must agree to the terms and conditions'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) return

    try {
      await signup(formData)
      setSignupSuccess(true)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleGoogleSignUp = async () => {
    // TODO: Implement Google OAuth
    alert('Google Sign Up will be implemented in the next step')
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    // Clear global error when user makes changes
    if (error) {
      clearError()
    }
  }

  // Show success message after signup
  if (signupSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Account Created!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We've sent a verification email to <strong>{formData.email}</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Check Your Email
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Click the verification link in your email to activate your account, then sign in to get started.
          </p>
          
          <div className="space-y-3">
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/auth/signin">
                Continue to Sign In
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSignupSuccess(false)}
            >
              Back to Sign Up
            </Button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
            Didn't receive an email? Check your spam folder or{' '}
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              resend verification
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YouTubeIntel
          </span>
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Create your account
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Start your YouTube intelligence journey today
        </p>
      </div>

      {/* Sign Up Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="John"
                className={validationErrors.first_name ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isLoading}
              />
              {validationErrors.first_name && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Doe"
                className={validationErrors.last_name ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isLoading}
              />
              {validationErrors.last_name && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              className={validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a strong password"
                className={validationErrors.password ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
            )}
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Password must contain at least 8 characters, including uppercase, lowercase, and a number
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="age_confirmed"
                checked={formData.age_confirmed}
                onCheckedChange={(checked) => handleInputChange('age_confirmed', checked as boolean)}
                className={validationErrors.age_confirmed ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="age_confirmed"
                  className="text-sm font-normal cursor-pointer"
                >
                  I confirm that I am 18 years of age or older
                </Label>
                {validationErrors.age_confirmed && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.age_confirmed}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreed_to_terms"
                checked={formData.agreed_to_terms}
                onCheckedChange={(checked) => handleInputChange('agreed_to_terms', checked as boolean)}
                className={validationErrors.agreed_to_terms ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="agreed_to_terms"
                  className="text-sm font-normal cursor-pointer"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
                {validationErrors.agreed_to_terms && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.agreed_to_terms}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
          <span className="px-4 text-sm text-slate-500 dark:text-slate-400">Or continue with</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Google Sign Up */}
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          variant="outline"
          className="w-full border-slate-300 dark:border-slate-600"
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link 
            href="/auth/signin" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}