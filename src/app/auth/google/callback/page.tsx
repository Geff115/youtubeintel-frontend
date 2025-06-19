'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

export default function GoogleCallbackPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = () => {
      // Parse the URL fragment to get tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const idToken = hashParams.get('id_token')
      const accessToken = hashParams.get('access_token')
      const errorParam = hashParams.get('error')
      const errorDescription = hashParams.get('error_description')

      if (errorParam) {
        const errorMessage = errorDescription || errorParam
        setError(errorMessage)
        
        // Send error message to opener window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { 
              type: 'google-auth-error', 
              error: errorMessage 
            },
            window.location.origin
          )
          setTimeout(() => window.close(), 2000)
        }
        return
      }

      if (idToken) {
        // Send ID token to opener window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { 
              type: 'google-auth-success', 
              idToken: idToken,
              accessToken: accessToken
            },
            window.location.origin
          )
          setTimeout(() => window.close(), 1000)
        } else {
          // If no opener, redirect to signin with error
          setError('Authentication window was closed. Please try signing in again.')
        }
      } else {
        setError('No authentication token received')
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { 
              type: 'google-auth-error', 
              error: 'No authentication token received' 
            },
            window.location.origin
          )
          setTimeout(() => window.close(), 2000)
        }
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This window will close automatically
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Completing sign in with Google
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we authenticate your account...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This window will close automatically
            </p>
          </>
        )}
      </div>
    </div>
  )
}