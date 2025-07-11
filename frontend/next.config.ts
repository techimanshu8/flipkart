import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external access to dev server
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  
  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
  
  // Allow images from any domain (optional, for development)
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
