import { SignInForm } from '@/components/auth/signin-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your YouTubeIntel account',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <SignInForm />
    </div>
  )
}