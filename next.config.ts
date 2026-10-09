const nextConfig = {
  // إعداداتك الحالية
eslint: {
  ignoreDuringBuilds: true,
},
  async headers() {
    return [
      // headers موجودة قبل كده لو عندك

      {
        source: "/downloads/ismail-dawah.apk",
        headers: [
          {
            key: "Content-Type",
            value: "application/vnd.android.package-archive",
          },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="ismail-dawah.apk"',
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;