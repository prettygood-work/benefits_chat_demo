/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Performance optimizations
  headers: async () => [
    {
      source: '/api/analytics',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=300, stale-while-revalidate=600'
        }
      ]
    },
    {
      source: '/analytics',
      headers: [
        {
          key: 'Cache-Control',
          value: 'private, max-age=0, must-revalidate'
        }
      ]
    }
  ],
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Image optimization
  images: {
    domains: ['avatar.vercel.sh'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundlePagesRouterDependencies: true,
    },
  }),
};

module.exports = nextConfig;