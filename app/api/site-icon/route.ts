import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clampSize(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 512;
  return Math.min(1024, Math.max(96, Math.round(parsed)));
}

function buildIconSvg(size: number, maskable: boolean): string {
  const radius = maskable ? 0 : Math.round(size * (96 / 512));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#06b6d4" />
      <stop offset="1" stop-color="#0e7490" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#background)" />
  <g transform="translate(16 16) scale(20)" fill="#fff">
    <path d="M12 3a9 9 0 1 0 9 9c0-1.5-.4-3-1.2-4.2A7 7 0 0 1 12 3z" />
    <circle cx="17" cy="6" r="1.5" fill="#d4af37" />
  </g>
</svg>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const size = clampSize(url.searchParams.get("size"));
  const maskable = url.searchParams.get("maskable") === "1";
  const png = await sharp(Buffer.from(buildIconSvg(size, maskable)))
    .png({ compressionLevel: 9 })
    .toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
