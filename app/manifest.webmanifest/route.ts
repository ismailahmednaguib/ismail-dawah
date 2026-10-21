import type { NextRequest } from "next/server";
import { buildManifest } from "@/lib/manifest";
import { preferredLanguageFromHeader } from "@/lib/i18n/config";

/**
 * احتياطي لمسار /manifest.webmanifest خارج صفحات اللغة.
 * الصفحات نفسها تشير إلى /ar/manifest.webmanifest أو /en/manifest.webmanifest.
 */
export function GET(request: NextRequest) {
  const lang = preferredLanguageFromHeader(
    request.headers.get("accept-language")
  );

  return new Response(JSON.stringify(buildManifest(lang)), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept-Language",
    },
  });
}
