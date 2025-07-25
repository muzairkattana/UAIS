/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config - let Next.js handle everything automatically
  swcMinify: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
