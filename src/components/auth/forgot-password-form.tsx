'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth-store'

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [validationError, setValidationError] = useState('')

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const emailError = validateEmail(email)
    if (emailError) {
      setValidationError(emailError)
      return
    }

    try {
      await forgotPassword(email)
      setEmailSent(true)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (validationError) setValidationError('')
    if (error) clearError()
  }

  // Show success message after email is sent
  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Check your email
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Reset link sent!
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Click the link in your email to reset your password. The link will expire in 1 hour for security.
          </p>
          
          <div className="space-y-3">
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Try different email
            </Button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
            Didn't receive an email? Check your spam folder or try again in a few minutes.
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
          Forgot your password?
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {/* Forgot Password Form */}
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
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Enter your email address"
              className={validationError ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
              autoFocus
            />
            {validationError && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We'll send password reset instructions to this email address.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>

        {/* Back to Sign In */}
        <div className="mt-6 text-center">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}