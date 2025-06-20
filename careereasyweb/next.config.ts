import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'careereasy-assets.s3.ca-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['@heroicons/react'],
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Tree shake unused imports
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    // Split chunks more aggressively
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      maxSize: 200000, // 200KB max chunk size
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 200000,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          maxSize: 200000,
        },
      },
    };
    
    return config;
  },
  // output: 'standalone', // Remove standalone to reduce bundle size
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
