import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'YouTubeIntel - Professional YouTube Channel Intelligence',
    template: '%s | YouTubeIntel'
  },
  description: 'Professional YouTube channel intelligence platform for creators, marketers, and researchers. Discover, analyze, and scale with AI-powered insights.',
  keywords: ['YouTube', 'channel analytics', 'content intelligence', 'creator tools', 'marketing insights'],
  authors: [{ name: 'YouTubeIntel Team' }],
  creator: 'YouTubeIntel',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'YouTubeIntel - Professional YouTube Channel Intelligence',
    description: 'Discover, analyze, and scale with AI-powered YouTube channel intelligence.',
    siteName: 'YouTubeIntel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YouTubeIntel - YouTube Channel Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTubeIntel - Professional YouTube Channel Intelligence',
    description: 'Discover, analyze, and scale with AI-powered YouTube channel intelligence.',
    images: ['/og-image.png'],
    creator: '@youtubeintel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}