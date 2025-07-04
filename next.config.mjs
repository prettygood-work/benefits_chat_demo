/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
  
  // Webpack optimization for Vercel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          maxSize: 244000,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000,
            },
          },
        },
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
  
  // Output configuration for better caching
  output: 'standalone',
  
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