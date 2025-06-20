import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/hooks/use-auth-provider'

// Configure Inter font with fallbacks
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
})

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}