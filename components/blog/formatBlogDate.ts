const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Full Sinhala month names (Sinhala doesn't conventionally abbreviate months).
const MONTHS_SI = [
  "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
  "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්",
];

/**
 * Deterministic UTC date format (avoids server/client locale + timezone drift).
 * Localized by `locale` (URL slug: "en" | "si") using explicit month tables — we
 * deliberately don't use Intl/toLocaleDateString here, since Node's ICU and the
 * browser's can format the same date differently and cause a hydration mismatch
 * in the client `BlogPostCard`.
 *
 * Lives in its own directive-free module so it can be called from both the
 * client `BlogPostCard` and the server `BlogPostTemplate`. (A plain function
 * re-exported from a `"use client"` module becomes a client reference and
 * throws if a Server Component calls it.)
 */
export function formatBlogDate(iso?: string | null, locale: string = "en"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  // Sinhala convention puts the year first: "2025 ජූනි 14".
  if (locale === "si") return `${year} ${MONTHS_SI[month]} ${day}`;
  return `${MONTHS_EN[month]} ${day}, ${year}`;
}
