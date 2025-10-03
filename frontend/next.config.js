/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Exclude test files from build
  pageExtensions: ['page.tsx', 'page.ts', 'tsx', 'ts', 'jsx', 'js'],
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'beuni-desafio-production.up.railway.app', // Railway backend
    ],
    unoptimized: false, // Enable optimization for production
  },

  // Output configuration for Vercel
  output: 'standalone',

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Trailing slash configuration
  trailingSlash: false,

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader',
    });

    // Exclude __tests__ directories
    config.module.rules.push({
      test: /.*(__tests__|\.test\.|\.spec\.).*/,
      loader: 'ignore-loader',
    });

    // Optimize for production
    if (!dev) {
      config.optimization.minimize = true;
    }
    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;