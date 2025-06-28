'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Play, Loader2, AlertCircle, CheckCircle, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth-store'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore()
  
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [resendEmail, setResendEmail] = useState('')
  const [showResendForm, setShowResendForm] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleVerification = useCallback(async (verificationToken: string) => {
    try {
      await verifyEmail(verificationToken)
      setVerificationStatus('success')
    } catch (error) {
      setVerificationStatus('error')
    }
  }, [verifyEmail])

  // Auto-verify if token is present
  useEffect(() => {
    if (token) {
      handleVerification(token)
    }
  }, [token, handleVerification])

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!resendEmail || !/\S+@\S+\.\S+/.test(resendEmail)) {
      return
    }

    try {
      await resendVerification(resendEmail)
      setResendSuccess(true)
    } catch (error) {
      // Error is handled by the store
    }
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Email verified!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your email address has been successfully verified.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Welcome to YouTubeIntel! 🎉
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your account is now active and you can start exploring YouTube channel intelligence.
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
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You&apos;ll get <strong>25 free credits</strong> to start discovering channels!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (verificationStatus === 'error' || (!token && !showResendForm)) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Verification failed
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            The verification link is invalid or has expired.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Need a new link?
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Verification links expire after 24 hours for security. 
            We can send you a new one.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setShowResendForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Send new verification link
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              className="w-full"
            >
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Resend form state
  if (showResendForm) {
    if (resendSuccess) {
      return (
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              New link sent!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              We&apos;ve sent a new verification link to <strong>{resendEmail}</strong>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Check your email and click the verification link. 
              The new link will expire in 24 hours.
            </p>
            
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full max-w-md">
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
            Resend verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter your email to get a new verification link
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResendVerification} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resend-email">Email address</Label>
              <Input
                id="resend-email"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isLoading}
                required
                autoFocus
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We&apos;ll send a new verification link to this email address.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading || !resendEmail}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send verification link'
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={() => setShowResendForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Loading state (while verifying with token)
  return (
    <div className="w-full max-w-md">
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
          Verifying your email...
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Please wait while we verify your email address
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Verifying...
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400">
          This should only take a moment.
        </p>
      </div>
    </div>
  )
}