import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your YouTubeIntel email address',
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <VerifyEmailForm />
    </div>
  )
}