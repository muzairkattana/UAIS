/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize package imports for better tree shaking
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  
  // Simple webpack config without babel-loader
  webpack: (config, { isServer }) => {
    // Only add fallbacks for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }
    return config
  },
  
  // Use SWC for faster builds (default in Next.js 13+)
  swcMinify: true,
  
  // Optimize images
  images: {
    unoptimized: true
  },
  
  // Disable source maps for faster builds
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
