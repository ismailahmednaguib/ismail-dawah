import type { NextRequest } from "next/server";
import { buildManifest } from "@/lib/manifest";
import { isValidLang } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/content";

/**
 * بيان تثبيت مستقل لكل لغة: /ar/manifest.webmanifest و/en/manifest.webmanifest.
 * المسار الجذري /manifest.webmanifest يبقى احتياطًا ويختار اللغة من ترويسة المتصفح.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  return params.then(async ({ lang }) => {
    if (!isValidLang(lang)) {
      return new Response("Not found", { status: 404 });
    }

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
  });
}
