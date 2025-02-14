/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-image-domains'],
  },
  experimental: {
    // optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // swcMinify: true,
}

module.exports = nextConfig 