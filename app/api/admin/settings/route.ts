import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { invalidateContentCache } from '@/lib/content';
import { PAGES } from '@/lib/page-sections';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SETTINGS_BYTES = 200_000;

type SettingsRow = { key?: unknown; lang?: unknown; value?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeSettings(value: unknown, depth = 0): unknown {
  if (depth > 8) return null;

  if (typeof value === 'string') {
    return value
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .slice(0, 10_000);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean' || value === null) return value;

  if (Array.isArray(value)) {
    return value.slice(0, 200).map((item) => sanitizeSettings(item, depth + 1));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 200)
        .filter(([key]) => !['__proto__', 'prototype', 'constructor'].includes(key.toLowerCase()))
        .map(([key, item]) => [key.slice(0, 128), sanitizeSettings(item, depth + 1)])
    );
  }

  return null;
}

function settingsRowsToRecord(rows: SettingsRow[]): Record<string, unknown> {
  const settings: Record<string, unknown> = {};

  for (const row of rows) {
    if (typeof row.key !== 'string' || !row.key.trim()) continue;

    const key =
      row.key === 'site.name'
        ? 'siteName'
        : row.key === 'site.description'
          ? 'siteDescription'
          : row.key;
    const value =
      isRecord(row.value) && 'value' in row.value
        ? row.value.value
        : row.value;

    if (row.lang === 'ar' || row.lang === 'en') {
      const current = isRecord(settings[key]) ? settings[key] : {};
      settings[key] = { ...current, [row.lang]: value };
    } else {
      settings[key] = value;
    }
  }

  return settings;
}

function settingsToRows(settings: Record<string, unknown>) {
  const rows: Array<Record<string, unknown>> = [];
  // مفاتيح غير مرتبطة بلغة (تُخزَّن مرة واحدة لا لكل لغة).
  const nonLocalized = new Set(['pageSections', 'sectionTitles', 'hiddenPages', 'navigation']);

  for (const [rawKey, value] of Object.entries(settings)) {
    const key = rawKey === 'siteName'
      ? 'site.name'
      : rawKey === 'siteDescription'
        ? 'site.description'
        : rawKey;
    if (isRecord(value) && ('ar' in value || 'en' in value) && !nonLocalized.has(rawKey)) {
      for (const lang of ['ar', 'en'] as const) {
        if (!(lang in value)) continue;
        rows.push({
          key,
          lang,
          value: { value: value[lang] },
        });
      }
    } else {
      rows.push({
        key,
        lang: nonLocalized.has(rawKey) ? 'all' : 'ar',
        value: { value },
      });
    }
  }

  return rows;
}

async function authorize() {
  const session = await getAdminSession();

  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'غير مصرح' }, { status: 401 }) };
  }

  if (!can(session.roles, 'settings.manage')) {
    return { session: null, response: NextResponse.json({ error: 'هذه الإعدادات متاحة لمالك المنصة فقط.' }, { status: 403 }) };
  }

  return { session, response: null };
}

export async function GET() {
  const auth = await authorize();
  if (auth.response) return auth.response;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_content')
      .select('data, updated_at')
      .eq('id', 1)
      .maybeSingle();

    const legacyContent = !error && isRecord(data?.data) ? data.data : {};
    const structured = await supabase
      .from('site_settings')
      .select('key, lang, value');
    const structuredSettings = !structured.error && Array.isArray(structured.data)
      ? settingsRowsToRecord(structured.data as SettingsRow[])
      : {};

    if (error && structured.error) {
      return NextResponse.json({ error: 'تعذر تحميل إعدادات المنصة.' }, { status: 500 });
    }

    return NextResponse.json({
      settings: {
        ...(isRecord(legacyContent.settings) ? legacyContent.settings : {}),
        ...structuredSettings,
      },
      updatedAt: data?.updated_at ?? null,
    });
  } catch (error) {
    console.error('[AdminSettings] GET error:', error);
    return NextResponse.json({ error: 'تعذر تحميل إعدادات المنصة.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authorize();
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => null);

    if (!isRecord(body) || !isRecord(body.settings)) {
      return NextResponse.json({ error: 'بيانات الإعدادات غير صحيحة.' }, { status: 400 });
    }

    const cleanSettings = sanitizeSettings(body.settings);
    const serializedSettings = JSON.stringify(cleanSettings);

    if (Buffer.byteLength(serializedSettings, 'utf8') > MAX_SETTINGS_BYTES) {
      return NextResponse.json({ error: 'حجم الإعدادات أكبر من المسموح.' }, { status: 413 });
    }

    const supabase = getSupabaseAdmin();
    const current = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    const currentContent = isRecord(current.data?.data) ? current.data.data : {};
    const updatedAt = new Date().toISOString();
    const nextContent = {
      ...currentContent,
      settings: cleanSettings,
    };

    let legacySaved = false;
    if (!current.error) {
      const legacyResult = await supabase
        .from('site_content')
        .upsert({ id: 1, data: nextContent, updated_at: updatedAt });
      legacySaved = !legacyResult.error;
      if (legacyResult.error) console.error('[AdminSettings] legacy PUT error:', legacyResult.error);
    }

    const structuredRows = isRecord(cleanSettings)
      ? settingsToRows(cleanSettings)
      : [];
    const structuredResult = structuredRows.length
      ? await supabase
          .from('site_settings')
          .upsert(structuredRows, { onConflict: 'key,lang' })
      : { error: null };

    if (!legacySaved && structuredResult.error) {
      console.error('[AdminSettings] structured PUT error:', structuredResult.error);
      return NextResponse.json({ error: 'تعذر حفظ إعدادات المنصة.' }, { status: 500 });
    }

    // الإعدادات العامة تظهر في الصفحة الرئيسية وصفحة البث، لذلك نحدّثهما فورًا.
    // نحدّث كذلك كل صفحات الموقع حتى تظهر تعديلات إظهار/إخفاء الأقسام فورًا.
    const revalidateTargets = new Set<string>();
    for (const lang of ['ar', 'en'] as const) {
      revalidateTargets.add(`/${lang}`);
      revalidateTargets.add(`/${lang}/live`);
      for (const [, path] of PAGES) {
        revalidateTargets.add(path === '/' ? `/${lang}` : `/${lang}${path}`);
      }
    }
    for (const target of revalidateTargets) {
      revalidatePath(target);
    }
    revalidatePath('/api/site-settings');
    invalidateContentCache();

    // سجل تغييرات مختصر بدون تخزين أي أسرار أو بيانات جلسة.
    await supabase.from('audit_log').insert({
      user_id: auth.session?.userId,
      action: 'update_site_settings',
      table_name: 'site_content',
      record_id: null,
      new_data: { keys: Object.keys(isRecord(cleanSettings) ? cleanSettings : {}) },
    });

    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) {
    console.error('[AdminSettings] PUT exception:', error);
    return NextResponse.json({ error: 'تعذر حفظ إعدادات المنصة.' }, { status: 500 });
  }
}
