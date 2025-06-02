/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Handle canvas in browser environment
    if (!isServer) {
      // Client-side: use fallback for canvas
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    } else {
      // Server-side: mark canvas as external
      config.externals.push({
        canvas: 'commonjs canvas',
        'pdfjs-dist': 'commonjs pdfjs-dist',
      });
    }
    return config;
  },
};

export default nextConfig; 