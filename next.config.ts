// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // تحسين الصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Headers للأداء والأمان
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/:lang/learn/:type/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:lang/quran/:id',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400' },
        ],
      },
    ];
  },

  // Redirects للروابط القديمة
  async redirects() {
    return [
      {
        source: '/ar/fields/:slug',
        destination: '/ar/learn?field=:slug',
        permanent: true,
      },
      {
        source: '/en/fields/:slug',
        destination: '/en/learn?field=:slug',
        permanent: true,
      },
    ];
  },

  // تحسينات إضافية
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  // ضغط
  compress: true,

  // Production source maps off
  productionBrowserSourceMaps: false,
};

export default nextConfig;