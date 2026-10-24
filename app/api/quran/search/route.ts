import { NextRequest, NextResponse } from "next/server";
import { isValidLang, type Lang } from "@/lib/i18n";
import { rateLimitGuard } from "@/lib/rate-limit";
import {
  mapQuranSearchResults,
  normalizeQuranSearchQuery,
  type QuranApiMatch,
} from "@/lib/quran/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EDITIONS: Record<Lang, string> = {
  ar: "quran-uthmani",
  en: "en.sahih",
};

function positiveInt(raw: string | null, fallback: number, max: number): number {
  if (!raw || !raw.trim()) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(value)));
}

export async function GET(req: NextRequest) {
  const limited = await rateLimitGuard(req, "search");
  if (limited) return limited;

  const params = req.nextUrl.searchParams;
  const requestedLang = params.get("lang") ?? "ar";
  if (!isValidLang(requestedLang)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  const lang = requestedLang as Lang;
  const query = normalizeQuranSearchQuery(params.get("q") ?? "");
  const limit = positiveInt(params.get("limit"), 20, 50);

  if (query.length < 2) {
    return NextResponse.json({ data: [], total: 0, query });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const url = new URL(
      `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${EDITIONS[lang]}`,
    );
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json({ data: [], total: 0, query, source_unavailable: true });
    }

    const payload = (await response.json()) as {
      code?: number;
      data?: { matches?: QuranApiMatch[] };
    };

    if (payload.code !== 200 || !Array.isArray(payload.data?.matches)) {
      return NextResponse.json({ data: [], total: 0, query, source_unavailable: true });
    }

    const data = mapQuranSearchResults(payload.data.matches, lang, limit);
    return NextResponse.json({ data, total: data.length, query, source: "AlQuran Cloud" });
  } catch {
    return NextResponse.json({ data: [], total: 0, query, source_unavailable: true });
  } finally {
    clearTimeout(timeout);
  }
}
