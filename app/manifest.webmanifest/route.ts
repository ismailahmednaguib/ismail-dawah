import type { NextRequest } from "next/server";
import { buildManifest } from "@/lib/manifest";
import { preferredLanguageFromHeader } from "@/lib/i18n/config";
import { getSiteSettings } from "@/lib/content";

/**
 * احتياطي لمسار /manifest.webmanifest خارج صفحات اللغة.
 * الصفحات نفسها تشير إلى /ar/manifest.webmanifest أو /en/manifest.webmanifest.
 */
export async function GET(request: NextRequest) {
  const lang = preferredLanguageFromHeader(
    request.headers.get("accept-language")
  );
  const settings = await getSiteSettings();

  return new Response(JSON.stringify(buildManifest(lang, settings.theme, {
    name: settings.ownerName,
    shortName: settings.shortName,
    description: settings.siteDescription,
  })), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept-Language",
    },
  });
}
