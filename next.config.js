/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized for deployment
  
  // Increase serverless function timeout
  serverRuntimeConfig: {
    maxDuration: 60, // 60 seconds
  },

  // Configure headers for caching and security
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
      // Security headers for all routes
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ],

  // Generate source maps in production for better error reporting
  productionBrowserSourceMaps: true,
  
  // Configure image optimization
  images: {
    domains: [
      'localhost',
      'vercel.app'
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Prevent server-side packages from being bundled client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
      };
    }

    return config;
  },
};

module.exports = nextConfig;
module.exports = nextConfig;
