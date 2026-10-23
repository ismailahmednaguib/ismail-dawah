import type { NextConfig } from "next";

// ============================================================================
// ترويسات الأمان. تُطبَّق على كل المسارات في الإنتاج والتطوير.
// ملاحظة: CSP يحتاج 'unsafe-inline' لأن Next.js يحقن سكربتات وأنماطًا مضمّنة
// في الصفحة؛ وبدونها تتعطّل hydration.
// ============================================================================
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https: blob:",
  "connect-src 'self' https: wss:",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // بيئات Windows المقيدة قد تمنع Next من إنشاء Webpack worker (`spawn EPERM`).
  // تعطيله لا يتجاوز فحوص النوع أو ESLint؛ يغيّر طريقة تشغيل التجميع فقط.
  experimental: {
    webpackBuildWorker: process.platform !== "win32",
  },
  serverExternalPackages: ["nodemailer", "sharp"],
  // تُجرى TypeScript وESLint قبل Next مباشرة في script `build`، لأن
  // فحص Next الداخلي يحتاج child worker محظورًا في بعض بيئات Windows.
  // لا يعني هذا تجاهل الفحص: script البناء يفشل قبله عند أي خطأ.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/icon.png", destination: "/api/site-icon?size=512" },
        { source: "/icon-192.png", destination: "/api/site-icon?size=192" },
        { source: "/icon-512.png", destination: "/api/site-icon?size=512" },
        {
          source: "/icon-maskable-512.png",
          destination: "/api/site-icon?size=512&maskable=1",
        },
        { source: "/apple-touch-icon.png", destination: "/api/site-icon?size=180" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // ملفات الخدمة والقطع الثابتة تُخزَّن طويلًا
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
