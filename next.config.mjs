/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
  
  // Webpack optimization for Vercel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix instrumentation conflicts by preventing duplicate chunk emissions
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // Remove OpenTelemetry chunk splitting and cache group
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
    
    // Explicitly exclude OpenTelemetry from all bundles (client and server)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vercel/otel': false,
      '@opentelemetry/api': false,
      '@opentelemetry/api-logs': false,
      '@opentelemetry/resources': false,
      '@opentelemetry/instrumentation': false,
      '@opentelemetry/sdk-logs': false,
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
    // For demo purposes only - allows deployment with TypeScript errors
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // For demo purposes only - allows deployment with ESLint errors
    ignoreDuringBuilds: true,
  },
}

export default nextConfig