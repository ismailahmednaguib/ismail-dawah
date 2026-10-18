/**
 * Reject cross-site state-changing requests when the browser provides an
 * Origin/Referer header. In production, the header is required by default;
 * this protects cookie-authenticated endpoints from CSRF while allowing an
 * explicit opt-out for trusted non-browser clients during migration.
 */
function requiresOriginHeader(): boolean {
  const configured = process.env.CSRF_REQUIRE_ORIGIN?.trim().toLowerCase();
  if (configured === "false" || configured === "0" || configured === "no") {
    return false;
  }

  if (configured === "true" || configured === "1" || configured === "yes") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

function hostMatches(hostname: string, allowedHost: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const allowed = allowedHost.toLowerCase().replace(/\.$/, "");
  return Boolean(allowed) && host === allowed;
}

function configuredSiteHosts(): string[] {
  const values = [
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.CSRF_ALLOWED_ORIGINS?.split(",") ?? []),
    ...(process.env.ALLOWED_ORIGINS?.split(",") ?? []),
  ];

  return values.flatMap((value) => {
    if (!value?.trim()) return [];
    try {
      return [new URL(value.trim()).hostname];
    } catch {
      const hostname = value.trim().split("/")[0]?.split(":")[0];
      return hostname ? [hostname] : [];
    }
  });
}

/** Return true when a mutation came from this site or an explicitly trusted site. */
export function isAllowedMutationOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")?.trim();
  const referer = request.headers.get("referer")?.trim();
  const candidate = origin || referer;

  if (!candidate) {
    return !requiresOriginHeader();
  }

  if (candidate.toLowerCase() === "null") {
    return false;
  }

  let candidateUrl: URL;
  let requestUrl: URL;
  try {
    candidateUrl = new URL(candidate);
    requestUrl = new URL(request.url);
  } catch {
    return false;
  }

  const allowedHosts = [requestUrl.hostname, ...configuredSiteHosts()];
  return allowedHosts.some((allowedHost) => hostMatches(candidateUrl.hostname, allowedHost));
}
