import type { NextRequest } from "next/server";
import { buildManifest } from "@/lib/manifest";
import { isValidLang } from "@/lib/i18n";

/**
 * بيان تثبيت مستقل لكل لغة: /ar/manifest.webmanifest و/en/manifest.webmanifest.
 * المسار الجذري /manifest.webmanifest يبقى احتياطًا ويختار اللغة من ترويسة المتصفح.
 */
export function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  return params.then(({ lang }) => {
    if (!isValidLang(lang)) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(JSON.stringify(buildManifest(lang)), {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        Vary: "Accept-Language",
      },
    });
  });
}
