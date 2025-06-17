import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set your new YouTubeIntel password',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  )
}