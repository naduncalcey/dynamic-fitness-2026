import { contentfulFetch } from "./client";

/**
 * Lightweight Contentful queries for the sitemap. We fetch ONLY the slug, the
 * last-publish time (for `lastmod`), and the noindex flag — no sections, rich
 * text, or images — so the query is cheap and never trips the complexity limit.
 * Results are cached via Next's data cache (revalidated hourly) so crawler hits
 * don't re-query Contentful every time.
 */

const REVALIDATE_SECONDS = 3600; // 1 hour
const PAGE_SIZE = 100; // Contentful GraphQL collection cap per request

export type SitemapEntry = {
  /** Page path ("/", "/careers") or bare blog slug — caller builds the URL. */
  slug: string;
  lastModified?: string | null;
};

type CollectionItem = {
  slug?: string | null;
  sys?: { publishedAt?: string | null } | null;
  seo?: { seoNoIndex?: boolean | null } | null;
};

type CollectionResponse = {
  total?: number;
  items?: Array<CollectionItem | null> | null;
};

const FLEXIBLE_PAGE_SITEMAP = /* GraphQL */ `
  query SitemapPages($limit: Int!, $skip: Int!) {
    collection: flexiblePageCollection(limit: $limit, skip: $skip) {
      total
      items {
        slug
        sys { publishedAt }
        seo { seoNoIndex }
      }
    }
  }
`;

const BLOG_POST_SITEMAP = /* GraphQL */ `
  query SitemapPosts($limit: Int!, $skip: Int!) {
    collection: blogPostCollection(limit: $limit, skip: $skip, order: [publishedDate_DESC]) {
      total
      items {
        slug
        sys { publishedAt }
        seo { seoNoIndex }
      }
    }
  }
`;

/** Page through a collection until every entry is fetched (future-proof). */
async function fetchAll(query: string): Promise<CollectionItem[]> {
  const out: CollectionItem[] = [];
  let skip = 0;
  for (;;) {
    const data = await contentfulFetch<{ collection?: CollectionResponse }>(
      query,
      { limit: PAGE_SIZE, skip },
      { revalidate: REVALIDATE_SECONDS }
    );
    const items = (data.collection?.items ?? []).filter(
      (i): i is CollectionItem => i !== null
    );
    out.push(...items);
    skip += items.length;
    const total = data.collection?.total ?? out.length;
    if (items.length === 0 || skip >= total) break;
  }
  return out;
}

/** Drop noindex entries and anything without a usable slug. */
function toEntries(items: CollectionItem[]): SitemapEntry[] {
  return items
    .filter((i) => !i.seo?.seoNoIndex && typeof i.slug === "string" && i.slug.length > 0)
    .map((i) => ({ slug: i.slug as string, lastModified: i.sys?.publishedAt ?? null }));
}

export async function getFlexiblePageEntries(): Promise<SitemapEntry[]> {
  try {
    return toEntries(await fetchAll(FLEXIBLE_PAGE_SITEMAP));
  } catch (error) {
    console.error("Sitemap: failed to fetch flexible pages:", error);
    return [];
  }
}

export async function getBlogPostEntries(): Promise<SitemapEntry[]> {
  try {
    return toEntries(await fetchAll(BLOG_POST_SITEMAP));
  } catch (error) {
    console.error("Sitemap: failed to fetch blog posts:", error);
    return [];
  }
}
