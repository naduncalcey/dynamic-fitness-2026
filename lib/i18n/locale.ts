/**
 * Locale config. URL slugs appear as the first path segment
 * (e.g. `/es/some-page`). The slug maps to a Contentful locale code that is
 * sent on every CDA request. Non-default locales fall back to the default at
 * the Contentful level, so a partially translated space still renders without
 * blanks. To add a locale, append a new entry to LOCALE_MAP.
 */

export type LocaleConfig = {
  urlSlug: string;
  contentfulCode: string;
  displayName: string;
  htmlLang: string;
};

export const LOCALE_MAP: LocaleConfig[] = [
  {
    urlSlug: "en",
    contentfulCode: "en-US",
    displayName: "English",
    htmlLang: "en-US",
  },
  {
    urlSlug: "si",
    // Add this locale code in Contentful → Settings → Locales (with en-US as its
    // fallback) so partially translated entries still render English, not blanks.
    contentfulCode: "si-LK",
    displayName: "සිංහල",
    htmlLang: "si-LK",
  },
];

export const DEFAULT_LOCALE = LOCALE_MAP[0];

export function getLocaleFromSlug(slug: string | undefined | null): LocaleConfig {
  if (!slug) return DEFAULT_LOCALE;
  return (
    LOCALE_MAP.find((l) => l.urlSlug === slug.toLowerCase()) ?? DEFAULT_LOCALE
  );
}

/**
 * Pulls a locale prefix off the front of a URL slug array.
 * - `["es", "some-page"]` → { locale: es, rest: ["some-page"] }
 * - `["some-page"]`       → { locale: en (default), rest: ["some-page"] }
 * - `[]`                  → { locale: en (default), rest: [] }
 */
export function splitLocaleFromSlug(
  slug: string[] | undefined
): { locale: LocaleConfig; rest: string[] } {
  if (!slug || slug.length === 0) {
    return { locale: DEFAULT_LOCALE, rest: [] };
  }
  const first = slug[0]?.toLowerCase();
  const match = LOCALE_MAP.find((l) => l.urlSlug === first);
  if (match) {
    return { locale: match, rest: slug.slice(1) };
  }
  return { locale: DEFAULT_LOCALE, rest: slug };
}

/** Resolve the locale a pathname maps to (the URL form of splitLocaleFromSlug). */
export function getLocaleFromPathname(pathname: string): LocaleConfig {
  const first = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return LOCALE_MAP.find((l) => l.urlSlug === first) ?? DEFAULT_LOCALE;
}

/**
 * Prefix an internal href with the active locale so clicking a link keeps the
 * chosen language. The default locale stays unprefixed. External/protocol and
 * fragment-only (`#…`) links pass through unchanged, as do paths already carrying
 * a locale prefix. Hash/query suffixes are preserved.
 *   localizeHref("/blog", si)     → "/si/blog"
 *   localizeHref("/#pricing", si) → "/si#pricing"
 *   localizeHref("#about", si)    → "#about"        (same-page anchor)
 *   localizeHref("/careers", en)  → "/careers"      (default locale)
 */
export function localizeHref(href: string, locale: LocaleConfig): string {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|\/\/|#)/i.test(href)) return href;
  if (locale.urlSlug === DEFAULT_LOCALE.urlSlug || !href.startsWith("/")) return href;
  const firstSegment = href.split("/")[1]?.toLowerCase();
  if (LOCALE_MAP.some((l) => l.urlSlug === firstSegment)) return href; // already prefixed
  const cut = href.search(/[#?]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const suffix = cut === -1 ? "" : href.slice(cut);
  return `/${locale.urlSlug}${path === "/" ? "" : path}${suffix}`;
}

/**
 * Build the equivalent path under `target` locale, preserving the current page.
 * Any existing locale prefix is stripped first; the default locale renders
 * without a prefix (English → `/careers`, Sinhala → `/si/careers`). Used by the
 * header language switcher. Hash/query are dropped (pathname only).
 */
export function switchLocalePath(pathname: string, target: LocaleConfig): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && LOCALE_MAP.some((l) => l.urlSlug === segments[0].toLowerCase())) {
    segments.shift();
  }
  const rest = segments.join("/");
  if (target.urlSlug === DEFAULT_LOCALE.urlSlug) {
    return rest ? `/${rest}` : "/";
  }
  return rest ? `/${target.urlSlug}/${rest}` : `/${target.urlSlug}`;
}
