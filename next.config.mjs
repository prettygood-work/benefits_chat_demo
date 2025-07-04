/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    // Disable instrumentation to prevent conflicts
    instrumentationHook: false,
  },
  
  // Webpack optimization for Vercel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix instrumentation conflicts
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // Prevent duplicate chunk emissions
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
            maxSize: 200000,
          },
        },
      },
    };
    
    return config;
  },
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['avatar.vercel.sh'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig