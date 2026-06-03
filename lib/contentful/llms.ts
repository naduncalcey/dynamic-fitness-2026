import { contentfulFetch } from "./client";

/**
 * Content fetchers for the /llms.txt and /llms-full.txt files. Lightweight,
 * json-only rich text (no links) to stay under the complexity limit, and cached
 * via Next's data cache (revalidated hourly) since these files are crawler-hit.
 */

const REVALIDATE_SECONDS = 3600;

export type LlmsPage = { slug: string; title: string | null };
export type LlmsPost = {
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  category: string | null;
  publishedDate: string | null;
  body: { json?: unknown } | null;
};
export type LlmsPlan = {
  name: string | null;
  description: string | null;
  price: string | null;
  priceSuffix: string | null;
  features: string[] | null;
};
export type LlmsFaq = { question: string | null; answer: { json?: unknown } | null };

const PAGES_QUERY = /* GraphQL */ `
  query LlmsPages {
    flexiblePageCollection(limit: 100) {
      items { slug pageTitle seo { seoNoIndex } }
    }
  }
`;

const POSTS_QUERY = /* GraphQL */ `
  query LlmsPosts {
    blogPostCollection(limit: 100, order: [publishedDate_DESC]) {
      items { title slug excerpt category publishedDate body { json } seo { seoNoIndex } }
    }
  }
`;

const PRICING_QUERY = /* GraphQL */ `
  query LlmsPricing {
    pricingPlanCollection(limit: 50) {
      items { name description price priceSuffix features }
    }
  }
`;

const FAQ_QUERY = /* GraphQL */ `
  query LlmsFaq {
    accordionCollection(where: { frontEndComponent: "Accordion - FAQ" }, limit: 5) {
      items {
        itemsCollection(limit: 25) {
          items { question answer { json } }
        }
      }
    }
  }
`;

const cached = { revalidate: REVALIDATE_SECONDS };

export async function getLlmsPages(): Promise<LlmsPage[]> {
  try {
    const data = await contentfulFetch<{
      flexiblePageCollection?: {
        items?: Array<{ slug?: string; pageTitle?: string | null; seo?: { seoNoIndex?: boolean | null } | null } | null>;
      };
    }>(PAGES_QUERY, {}, cached);
    return (data.flexiblePageCollection?.items ?? [])
      .filter((p): p is NonNullable<typeof p> => !!p && !p.seo?.seoNoIndex && !!p.slug)
      .map((p) => ({ slug: p.slug as string, title: p.pageTitle ?? null }));
  } catch (error) {
    console.error("llms: failed to fetch pages:", error);
    return [];
  }
}

export async function getLlmsPosts(): Promise<LlmsPost[]> {
  try {
    const data = await contentfulFetch<{
      blogPostCollection?: { items?: Array<(LlmsPost & { seo?: { seoNoIndex?: boolean | null } | null }) | null> };
    }>(POSTS_QUERY, {}, cached);
    return (data.blogPostCollection?.items ?? [])
      .filter((p): p is NonNullable<typeof p> => !!p && !p.seo?.seoNoIndex)
      .map(({ title, slug, excerpt, category, publishedDate, body }) => ({
        title,
        slug,
        excerpt,
        category,
        publishedDate,
        body,
      }));
  } catch (error) {
    console.error("llms: failed to fetch posts:", error);
    return [];
  }
}

export async function getLlmsPricing(): Promise<LlmsPlan[]> {
  try {
    const data = await contentfulFetch<{
      pricingPlanCollection?: { items?: Array<LlmsPlan | null> };
    }>(PRICING_QUERY, {}, cached);
    return (data.pricingPlanCollection?.items ?? []).filter(
      (p): p is LlmsPlan => p !== null
    );
  } catch (error) {
    console.error("llms: failed to fetch pricing:", error);
    return [];
  }
}

export async function getLlmsFaq(): Promise<LlmsFaq[]> {
  try {
    const data = await contentfulFetch<{
      accordionCollection?: {
        items?: Array<{ itemsCollection?: { items?: Array<LlmsFaq | null> } } | null>;
      };
    }>(FAQ_QUERY, {}, cached);
    return (data.accordionCollection?.items ?? [])
      .flatMap((a) => a?.itemsCollection?.items ?? [])
      .filter((i): i is LlmsFaq => i !== null);
  } catch (error) {
    console.error("llms: failed to fetch faq:", error);
    return [];
  }
}
