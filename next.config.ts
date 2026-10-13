import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // تجاهل أخطاء ESLint أثناء البناء على Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // تجاهل أخطاء TypeScript أثناء البناء
    ignoreBuildErrors: true,
  },
  // ... باقي الإعدادات الخاصة بك
};

export default nextConfig;