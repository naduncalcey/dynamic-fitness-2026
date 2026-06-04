import { contentfulFetch } from "./client";
import { LOCALE_MAP } from "@/lib/i18n/locale";

/**
 * UI label fetching. The `uiLabel` content type holds one entry per interface
 * string (nav, buttons, form labels, cookie banner) with a localized `value`.
 * We fetch the whole (small) set per locale and expose it as a key→value map.
 * Labels rarely change, so responses are cached (revalidated) rather than
 * fetched on every request like page content.
 */

export type LabelMap = Record<string, string>;
/** Label maps keyed by locale URL slug, e.g. `{ en: {...}, si: {...} }`. */
export type AllLabels = Record<string, LabelMap>;

const QUERY = /* GraphQL */ `
  query UiLabels($locale: String) {
    uiLabelCollection(locale: $locale, limit: 200) {
      items { key value }
    }
  }
`;

type Resp = {
  uiLabelCollection?: { items?: Array<{ key?: string | null; value?: string | null } | null> | null };
};

async function getUiLabels(localeCode: string): Promise<LabelMap> {
  try {
    const data = await contentfulFetch<Resp>(QUERY, { locale: localeCode }, { revalidate: 300 });
    const map: LabelMap = {};
    for (const item of data.uiLabelCollection?.items ?? []) {
      if (item?.key && typeof item.value === "string") map[item.key] = item.value;
    }
    return map;
  } catch (error) {
    console.error(`Failed to fetch UI labels (${localeCode}):`, error);
    return {};
  }
}

/** Fetch every configured locale's labels, keyed by URL slug. */
export async function getAllUiLabels(): Promise<AllLabels> {
  const entries = await Promise.all(
    LOCALE_MAP.map(async (l) => [l.urlSlug, await getUiLabels(l.contentfulCode)] as const)
  );
  return Object.fromEntries(entries);
}
