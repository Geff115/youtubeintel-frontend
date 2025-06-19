import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credits & Billing',
  description: 'Purchase credits and manage your YouTubeIntel billing',
}

export default function CreditsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}