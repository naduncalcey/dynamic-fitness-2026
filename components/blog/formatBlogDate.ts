const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Deterministic UTC date format (avoids server/client locale + timezone drift).
 *
 * Lives in its own directive-free module so it can be called from both the
 * client `BlogPostCard` and the server `BlogPostTemplate`. (A plain function
 * re-exported from a `"use client"` module becomes a client reference and
 * throws if a Server Component calls it.)
 */
export function formatBlogDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
