import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';

export const runtime = 'nodejs';
export const revalidate = 60;

const PUBLIC_KEYS = new Set([
  'ownerName', 'shortName', 'jobTitle', 'motto', 'homeKicker', 'homeTitle',
  'homeSubtitle', 'homeHeroText', 'homeCta1', 'homeCta2', 'portraitSrc',
  'ogImage', 'email', 'wa', 'address', 'cred1', 'cred2', 'facebookUrl',
  'youtubeUrl', 'telegramUrl', 'twitterUrl', 'instagramUrl', 'liveUrl',
  'meetingLink', 'liveTitle', 'meetingDay', 'meetingTime', 'meetingPlace',
  'showPrayerBar', 'siteName', 'siteDescription', 'metaTitle', 'metaDescription',
  // التحكم في الأقسام والظهور (يقرأها الموقع لعرض/إخفاء الأقسام فورًا)
  'pageSections', 'sectionTitles', 'hiddenPages',
  // هيكل التنقّل (يقرأه الهيدر والفوتر ليعكس إعدادات اللوحة)
  'navigation',
]);

function publicSettings(settings: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(settings).filter(([key]) => PUBLIC_KEYS.has(key))
  );
}

export async function GET() {
  try {
    const settings = publicSettings(await getSiteSettings());

    return NextResponse.json(
      { settings },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('[SiteSettings] GET error:', error);
    return NextResponse.json({ settings: {} }, { status: 200 });
  }
}
