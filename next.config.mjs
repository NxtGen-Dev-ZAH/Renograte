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
    // Turbopack configuration (for Next.js 15.1.3)
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Webpack configuration (used for production builds when not using --turbo)
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