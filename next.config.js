/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  webpack: (config, { isServer }) => {
    // Optimize for faster builds
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }
    
    // Tree shaking for three.js
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/three/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    })
    
    return config
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Optimize images
  images: {
    unoptimized: true // Since you're using static assets
  },
  
  // Reduce bundle analysis overhead
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
