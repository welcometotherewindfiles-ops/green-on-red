import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow the Genspark sandbox dev origin for HMR in development
  allowedDevOrigins: [
    '*.sandbox.novita.ai',
    'localhost:3000',
  ],
  images: {
    remotePatterns: [
      // YouTube thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
}

export default nextConfig
