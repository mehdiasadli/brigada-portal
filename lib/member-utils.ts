/**
 * Generate a URL-safe slug from a member's name
 * This matches the same logic used in the member pages
 */
export function generateMemberSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generate the full URL path for a member profile
 */
export function getMemberProfileUrl(memberName: string): string {
  const slug = generateMemberSlug(memberName);
  return `/members/${encodeURIComponent(slug)}`;
}
