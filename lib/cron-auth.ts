// lib/cron-auth.ts
// تحقق موحّد من طلبات Vercel Cron عبر CRON_SECRET.
// يقبل ترويسة Authorization: Bearer <secret> أو x-cron-secret.

type RequestLike = {
  headers: {
    get(name: string): string | null;
  };
};

export function isCronAuthorized(request: RequestLike): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const bearer = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    .trim();

  return bearer === secret || request.headers.get('x-cron-secret') === secret;
}
