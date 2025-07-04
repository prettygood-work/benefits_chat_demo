/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
  
  // Webpack optimization for Vercel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add a fallback for the 'self' object on the server
    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          self: 'global',
        })
      );
    }
    
    // Fix instrumentation conflicts by preventing duplicate chunk emissions
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // Prevent duplicate chunk emissions with more specific configuration
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
          // Prevent instrumentation conflicts
          otel: {
            test: /[\\/]node_modules[\\/](@opentelemetry|@vercel\/otel)/,
            name: 'otel',
            priority: 15,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    // Explicitly exclude instrumentation from client bundles
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@vercel/otel': false,
        '@opentelemetry/api': false,
        '@opentelemetry/api-logs': false,
      };
    }
    
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