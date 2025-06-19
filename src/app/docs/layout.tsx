import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Complete guide to using YouTubeIntel',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}