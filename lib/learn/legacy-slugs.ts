/**
 * Candidates for old content URLs.
 *
 * We only return transformations with a known, unambiguous meaning. The
 * caller must still verify that the candidate exists and has the requested
 * content type before redirecting.
 */
export function legacySlugCandidates(type: string, slug: string): string[] {
  const candidates = [slug];
  const duplicatePrefix = `${type}-${type}-`;

  if (type === 'hadith' && slug.startsWith(duplicatePrefix)) {
    candidates.push(`${type}-${slug.slice(duplicatePrefix.length)}`);
  }

  return [...new Set(candidates)];
}
