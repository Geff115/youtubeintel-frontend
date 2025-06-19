'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, XCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useVerifyPayment } from '@/hooks/use-dashboard-data'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  
  const { data: paymentData, isLoading, error } = useVerifyPayment(reference || '')

  useEffect(() => {
    if (!reference) {
      router.push('/dashboard/credits')
      return
    }

    if (paymentData) {
      if (paymentData.korapay_status === 'success' && paymentData.database_status === 'completed') {
        setVerificationStatus('success')
      } else {
        setVerificationStatus('failed')
      }
    } else if (error) {
      setVerificationStatus('failed')
    }
  }, [paymentData, error, reference, router])

  if (!reference) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {verificationStatus === 'verifying' && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Verifying Payment
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'success' && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Payment Successful!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your credits have been added to your account.
              </p>
              
              {paymentData && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Credits Added:</span>
                    <span className="font-semibold">{paymentData.credits}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Amount Paid:</span>
                    <span className="font-semibold">${paymentData.amount_usd}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Reference:</span>
                    <span className="font-mono text-xs">{reference}</span>
                  </div>
                </div>
              )}
              
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'failed' && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Payment Verification Failed
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We couldn&apos;t verify your payment. Please contact support if you believe this is an error.
              </p>
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/dashboard/credits">
                    Try Again
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <a href="mailto:support@youtubeintel.com">
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}