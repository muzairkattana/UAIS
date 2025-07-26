/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ultra-minimal config - zero custom webpack rules
  // Let Next.js handle everything with defaults
  
  // Use SWC (default compiler)
  swcMinify: true,
  
  // Basic image config
  images: {
    unoptimized: true
  },
  
  // Disable source maps for faster builds
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
