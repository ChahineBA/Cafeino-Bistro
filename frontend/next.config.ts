import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Optimize compilation speed with Turbopack
  experimental: {
    // Use optimized package imports for better tree-shaking and faster compilation
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'date-fns', '@tanstack/react-query'],
  },
  
  // Empty turbopack config to silence the warning (Turbopack is enabled by default)
  turbopack: {},
  
  // Reduce compilation overhead
  reactStrictMode: true,
  
  // Optimize production builds
  compress: true,
  
  // Reduce page data size
  poweredByHeader: false,
};

export default nextConfig;
