// scripts/generate-og.mjs
// يُولّد صورتَي المشاركة الاجتماعية (Open Graph) بمقاس 1200×630 لكل لغة.
// التشغيل: node scripts/generate-og.mjs
//
// يعتمد على sharp (موجود ضمن تبعيات Next) ويستخدم خطوط النظام لتصيير العربية،
// فلا يحتاج اتصالًا بالشبكة ولا ملفات خطوط إضافية.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "og");
const ICON = join(ROOT, "public", "icon-512.png");

const THEME = {
  bgTop: "#0a2a20",
  bgBottom: "#04140f",
  gold: "#d4af37",
  goldSoft: "#e8cf7a",
  text: "#f8fafc",
  muted: "#cbd5e1",
  faint: "#8aa39a",
};

const FONT = "Segoe UI, Tahoma, Arial, sans-serif";

const COPY = {
  ar: {
    primary: "اكتشف الإسلام",
    secondary: "Discover Islam",
    tagline: "القرآن الكريم، الأذكار، الفتاوى، مواقيت الصلاة، القبلة",
  },
  en: {
    primary: "Discover Islam",
    secondary: "اكتشف الإسلام",
    tagline: "Quran · Adhkar · Fatwas · Prayer Times · Qibla",
  },
};

function backgroundSvg(copy) {
  const isArabic = copy.primary === "اكتشف الإسلام";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${THEME.bgTop}"/>
      <stop offset="1" stop-color="${THEME.bgBottom}"/>
    </linearGradient>
    <radialGradient id="glowGold" cx="50%" cy="0%" r="70%">
      <stop offset="0" stop-color="${THEME.gold}" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="${THEME.gold}" stop-opacity="0.05"/>
      <stop offset="1" stop-color="${THEME.gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowTeal" cx="100%" cy="100%" r="70%">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowGold)"/>
  <rect width="1200" height="630" fill="url(#glowTeal)"/>

  <!-- شريط ذهبي علوي -->
  <rect x="0" y="0" width="1200" height="6" fill="${THEME.gold}" opacity="0.85"/>

  <!-- زخارف خفيفة -->
  <g fill="none" stroke="${THEME.gold}" stroke-opacity="0.14" stroke-width="2">
    <rect x="52" y="470" width="120" height="120" transform="rotate(45 112 530)"/>
    <rect x="1080" y="70" width="120" height="120" transform="rotate(45 1140 130)"/>
    <circle cx="112" cy="530" r="96"/>
    <circle cx="1140" cy="130" r="96"/>
  </g>

  <!-- إطار الشعار -->
  <rect x="530" y="56" width="140" height="140" rx="34" fill="#08211a" stroke="${THEME.gold}" stroke-opacity="0.55" stroke-width="2"/>

  <!-- النص -->
  <text x="600" y="304" text-anchor="middle" font-family="${FONT}" font-size="${isArabic ? 86 : 82}" font-weight="700" fill="${THEME.text}">${copy.primary}</text>
  <text x="600" y="378" text-anchor="middle" font-family="${FONT}" font-size="${isArabic ? 44 : 46}" fill="${THEME.goldSoft}">${copy.secondary}</text>

  <rect x="520" y="414" width="160" height="3" rx="1.5" fill="${THEME.gold}" opacity="0.7"/>

  <text x="600" y="474" text-anchor="middle" font-family="${FONT}" font-size="29" fill="${THEME.muted}">${copy.tagline}</text>
  <text x="600" y="566" text-anchor="middle" font-family="${FONT}" font-size="25" fill="${THEME.faint}">ismailahmednaguib.vercel.app</text>
</svg>`;
}

async function build(lang) {
  const copy = COPY[lang];
  const svg = backgroundSvg(copy);

  const icon = await sharp(ICON)
    .resize(112, 112, { fit: "cover" })
    .png()
    .toBuffer();

  const out = await sharp(Buffer.from(svg))
    .composite([{ input: icon, top: 70, left: 544 }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const file = join(OUT_DIR, `og-${lang}.png`);
  await sharp(out).toFile(file);
  return { file, bytes: out.length };
}

mkdirSync(OUT_DIR, { recursive: true });

for (const lang of ["ar", "en"]) {
  const { file, bytes } = await build(lang);
  console.log(`${lang}: ${file} (${bytes} bytes)`);
}
