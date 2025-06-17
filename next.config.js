/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features (updated for Next.js 15)
  experimental: {
    // Add any experimental features you need here
  },

  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: [],

  // Image optimization
  images: {
    domains: [
      'i.ytimg.com',
      'yt3.ggpht.com',
      'yt3.googleusercontent.com',
      'lh3.googleusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    return config
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. Not recommended for production.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Not recommended for production.
    ignoreDuringBuilds: false,
  },

  // Output configuration for deployment
  output: 'standalone',

  // Compression
  compress: true,

  // Power-ups
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  swcMinify: true, // Enable SWC minification

  // Note: swcMinify is now enabled by default in Next.js 15
}

module.exports = nextConfig