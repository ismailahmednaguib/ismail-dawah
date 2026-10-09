// app/manifest.ts
import type { MetadataRoute } from "next";

// ============================================================
// إعدادات الموقع
// ============================================================

/**
 * رابط الموقع الأساسي.
 *
 * على Vercel يفضّل إضافة Variable:
 * NEXT_PUBLIC_SITE_URL=https://ismailahmednaguib.vercel.app
 *
 * ولو المتغير مش موجود، هيستخدم الرابط الاحتياطي ده.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://ismailahmednaguib.vercel.app"
).replace(/\/+$/, "");

// ============================================================
// Manifest
// ============================================================

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: SITE_URL,
    name: "منصة إسماعيل أحمد نجيب الدعوية",
    short_name: "إسماعيل نجيب",
    description:
      "منصة إسلامية دعوية شاملة تجمع القرآن، الأذكار، الفتاوى، قصص الأنبياء، مواقيت الصلاة، اتجاه القبلة، المسبحة، خطة حفظ القرآن، الرقية الشرعية، الورد اليومي، حاسبة الزكاة، الميراث، دليل الحج والعمرة، دليل الدعوة، المقالات، والأسئلة الشائعة.",

    start_url: "/ar",
    scope: "/",

    display: "standalone",
    orientation: "portrait-primary",

    background_color: "#ffffff",
    theme_color: "#0f766e",

    lang: "ar",
    dir: "rtl",

    categories: [
      "education",
      "lifestyle",
      "reference",
      "utilities",
    ],

    icons: [
      {
        src: "/icons/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    shortcuts: [
      {
        name: "القرآن الكريم",
        short_name: "القرآن",
        description: "تصفح السور والاستماع والقراءة",
        url: "/ar/quran",
      },
      {
        name: "الأذكار",
        short_name: "الأذكار",
        description: "أذكار الصباح والمساء والنوم وبعد الصلاة",
        url: "/ar/adhkar",
      },
      {
        name: "مواقيت الصلاة",
        short_name: "الصلاة",
        description: "مواقيت الصلاة حسب موقعك",
        url: "/ar/prayer-times",
      },
      {
        name: "اتجاه القبلة",
        short_name: "القبلة",
        description: "بوصلة اتجاه القبلة والمسافة إلى مكة",
        url: "/ar/qibla",
      },
      {
        name: "المسبحة",
        short_name: "المسبحة",
        description: "عدّاد تفاعلي للتسبيح والذكر",
        url: "/ar/tasbih",
      },
      {
        name: "خطة حفظ القرآن",
        short_name: "الحفظ",
        description: "نظّم وردك اليومي من الحفظ والمراجعة",
        url: "/ar/quran-memorization",
      },
      {
        name: "حاسبة الزكاة",
        short_name: "الزكاة",
        description: "احسب زكاة المال حسب النصاب والديون",
        url: "/ar/zakat",
      },
      {
        name: "دليل الحج والعمرة",
        short_name: "الحج",
        description: "خطوات النسك والأدعية والأخطاء الشائعة",
        url: "/ar/hajj-guide",
      },
      {
        name: "البحث",
        short_name: "بحث",
        description: "ابحث في القرآن والأذكار والفتاوى والقصص والصفحات",
        url: "/ar/search",
      },
    ],

    prefer_related_applications: false,
  };
}