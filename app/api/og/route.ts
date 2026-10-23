import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const THEME = {
  bgTop: '#0a2a20',
  bgBottom: '#04140f',
  gold: '#d4af37',
  goldSoft: '#e8cf7a',
  text: '#f8fafc',
  muted: '#cbd5e1',
  faint: '#8aa39a',
};

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function queryText(value: string | null, fallback: string, max: number): string {
  const clean = (value || '').replace(/\s+/g, ' ').trim().slice(0, max);
  return clean || fallback;
}

function splitDescription(value: string, max = 58): string[] {
  const words = value.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function buildSvg({
  lang,
  title,
  description,
  type,
}: {
  lang: 'ar' | 'en';
  title: string;
  description: string;
  type: string;
}): string {
  const arabic = lang === 'ar';
  const direction = arabic ? 'rtl' : 'ltr';
  const lines = splitDescription(description);
  const titleSize = title.length > 48 ? 54 : title.length > 32 ? 64 : 76;
  const descriptionSvg = lines
    .map(
      (line, index) =>
        `<text x="600" y="${430 + index * 34}" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="25" fill="${THEME.muted}" direction="${direction}">${escapeXml(line)}</text>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${THEME.bgTop}"/>
      <stop offset="1" stop-color="${THEME.bgBottom}"/>
    </linearGradient>
    <radialGradient id="glowGold" cx="50%" cy="0%" r="70%">
      <stop offset="0" stop-color="${THEME.gold}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${THEME.gold}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowGold)"/>
  <rect width="1200" height="6" fill="${THEME.gold}" opacity="0.85"/>
  <g fill="none" stroke="${THEME.gold}" stroke-opacity="0.14" stroke-width="2">
    <rect x="52" y="470" width="120" height="120" transform="rotate(45 112 530)"/>
    <rect x="1080" y="70" width="120" height="120" transform="rotate(45 1140 130)"/>
    <circle cx="112" cy="530" r="96"/>
    <circle cx="1140" cy="130" r="96"/>
  </g>
  <text x="600" y="92" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="24" font-weight="700" fill="${THEME.goldSoft}" direction="${direction}">${escapeXml(type)}</text>
  <text x="600" y="274" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="${THEME.text}" direction="${direction}">${escapeXml(title)}</text>
  <rect x="520" y="322" width="160" height="3" rx="1.5" fill="${THEME.gold}" opacity="0.7"/>
  ${descriptionSvg}
  <text x="600" y="570" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="24" fill="${THEME.faint}">ismailahmednaguib.vercel.app</text>
</svg>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang: 'ar' | 'en' = url.searchParams.get('lang') === 'en' ? 'en' : 'ar';
  const title = queryText(
    url.searchParams.get('title'),
    lang === 'ar' ? 'اكتشف الإسلام' : 'Discover Islam',
    110,
  );
  const description = queryText(
    url.searchParams.get('description'),
    lang === 'ar' ? 'محتوى إسلامي موثق بلغتين' : 'Bilingual, referenced Islamic content',
    180,
  );
  const type = queryText(url.searchParams.get('type'), lang === 'ar' ? 'محتوى إسلامي' : 'Islamic content', 40);

  try {
    const icon = await readFile(path.join(process.cwd(), 'public', 'icon-512.png'));
    const png = await sharp(Buffer.from(buildSvg({ lang, title, description, type })))
      .composite([{ input: await sharp(icon).resize(112, 112, { fit: 'cover' }).png().toBuffer(), top: 70, left: 544 }])
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[OG] dynamic image failed:', error);
    const fallback = await readFile(path.join(process.cwd(), 'public', 'og', `og-${lang}.png`));
    return new Response(fallback, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
