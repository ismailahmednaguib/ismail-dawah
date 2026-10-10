// app/manifest.ts
import type { MetadataRoute } from "next";

// ============================================================
// Site URL
// ============================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "")
    : "https://ismailahmednaguib.vercel.app");

// ============================================================
// Icons & Colors
// ============================================================

const ICONS = {
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  maskable512: "/icon-maskable-512.png",
  appleTouchIcon: "/apple-touch-icon.png",
};

const COLORS = {
  background: "#f8fafc",
  theme: "#0e7490",
};

// ============================================================
// Types
// ============================================================

type ManifestLang = "ar" | "en";

type MaybeParams = {
  lang?: string;
};

type ManifestContext = {
  params?: Promise<MaybeParams> | MaybeParams;
};

type Shortcut = {
  name: string;
  short_name: string;
  description?: string;
  url: string;
};

type ManifestText = {
  name: string;
  short_name: string;
  description: string;
  shortcuts: Shortcut[];
};

// ============================================================
// Manifest text per language
// ============================================================

const MANIFEST_TEXT: Record<ManifestLang, ManifestText> = {
  ar: {
    name: "منصة إسماعيل أحمد نجيب الدعوية",
    short_name: "إسماعيل نجيب",
    description:
      "منصة إسلامية دعوية شاملة: القرآن، الأذكار، الفتاوى، مواقيت الصلاة، القبلة، المسبحة، خطة الحفظ، الزكاة، الحج، الدعوة، والمقالات.",
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
  },

  en: {
    name: "Ismail Ahmed Naguib Dawah Platform",
    short_name: "Ismail Naguib",
    description:
      "A comprehensive Islamic dawah platform: Quran, adhkar, fatwas, prayer times, qibla, tasbih, memorization plan, zakat, Hajj guide, dawah tools, and articles.",
    shortcuts: [
      {
        name: "Holy Quran",
        short_name: "Quran",
        description: "Browse surahs, listen, and read",
        url: "/en/quran",
      },
      {
        name: "Adhkar",
        short_name: "Adhkar",
        description:
          "Morning, evening, sleep, and after-prayer remembrances",
        url: "/en/adhkar",
      },
      {
        name: "Prayer Times",
        short_name: "Prayer",
        description: "Prayer times based on your location",
        url: "/en/prayer-times",
      },
      {
        name: "Qibla Direction",
        short_name: "Qibla",
        description: "Qibla compass and distance to Makkah",
        url: "/en/qibla",
      },
      {
        name: "Tasbih Counter",
        short_name: "Tasbih",
        description: "Interactive counter for dhikr and tasbih",
        url: "/en/tasbih",
      },
      {
        name: "Quran Memorization Plan",
        short_name: "Memorize",
        description: "Organize your daily memorization and revision",
        url: "/en/quran-memorization",
      },
      {
        name: "Zakat Calculator",
        short_name: "Zakat",
        description: "Calculate zakat based on nisab and debts",
        url: "/en/zakat",
      },
      {
        name: "Hajj & Umrah Guide",
        short_name: "Hajj",
        description: "Steps, duʿas, and common mistakes",
        url: "/en/hajj-guide",
      },
      {
        name: "Search",
        short_name: "Search",
        description:
          "Search Quran, adhkar, fatwas, stories, and pages",
        url: "/en/search",
      },
    ],
  },
};

// ============================================================
// Safe lang resolver
// ============================================================

async function resolveLang(ctx?: ManifestContext): Promise<ManifestLang> {
  try {
    const params = await ctx?.params;
    return params?.lang === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

// ============================================================
// Manifest generator
// ============================================================

export default async function manifest(
  ctx?: ManifestContext
): Promise<MetadataRoute.Manifest> {
  const lang = await resolveLang(ctx);
  const text = MANIFEST_TEXT[lang];

  return {
    id: `${SITE_URL}/${lang}`,
    name: text.name,
    short_name: text.short_name,
    description: text.description,

    start_url: `/${lang}`,
    scope: "/",

    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait-primary",

    background_color: COLORS.background,
    theme_color: COLORS.theme,

    lang,
    dir: lang === "ar" ? "rtl" : "ltr",

    categories: ["education", "reference", "lifestyle", "utilities"],

    icons: [
      {
        src: ICONS.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICONS.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICONS.maskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: ICONS.appleTouchIcon,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],

    shortcuts: text.shortcuts,

    prefer_related_applications: false,
  } as MetadataRoute.Manifest;
}