/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eutsywibykwwvpqsrgkz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'scims-app.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Headers for PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  // PWA asset optimization
  async rewrites() {
    return [
      {
        source: '/icons/:path*',
        destination: '/icons/:path*',
      },
    ];
  },

  // Enable PWA features
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Enable service worker in development
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
