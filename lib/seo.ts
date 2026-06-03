import type { Metadata } from "next";
import type { BlogPostEntry } from "@/lib/contentful/blog/types";

/**
 * Site-level SEO constants + helpers shared across routes. The base URL drives
 * `metadataBase` (so relative OG/canonical URLs resolve to absolute) and the
 * canonical/structured-data builders below.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dynamicfitness.lk"
).replace(/\/+$/, "");

export const SITE_NAME = "Dynamic Fitness";
export const LEGAL_NAME = "Dynamic Fitness (Pvt) Ltd.";

/**
 * Real business facts used in structured data. Kept here as the single source
 * of truth (mirrors the footer/header copy). Update here if any of these change.
 */
export const BUSINESS = {
  legalName: LEGAL_NAME,
  telephone: "+94772403117",
  // Public social profiles (sameAs) reinforce entity identity for search/AI.
  sameAs: ["https://www.instagram.com/dynamicfitness.lk"],
  priceRange: "Rs 6,000 – Rs 58,000",
  address: {
    street: "14 Dewananada Road, Nawinna",
    locality: "Maharagama",
    region: "Western Province",
    country: "LK",
  },
  // Opening hours from the footer: Mon–Sat 05:30–23:00, Sun 06:00–11:30.
  hours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "05:30",
      closes: "23:00",
    },
    { days: ["Sunday"], opens: "06:00", closes: "11:30" },
  ],
} as const;

/** Resolve a path or partial URL to an absolute URL on the canonical host. */
export function absoluteUrl(path?: string | null): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}

/**
 * Build full Open Graph + Twitter + canonical metadata for a blog post. Prefers
 * the linked SEO entry's fields, falling back to the post's own title, excerpt,
 * cover image, author, and date so every post gets sensible SEO even without a
 * hand-authored SEO entry.
 */
export function blogPostMetadata(post: BlogPostEntry): Metadata {
  const seo = post.seo;
  const slug = (post.slug ?? "").replace(/^\/+/, "");
  const url = absoluteUrl(`/blog/${slug}`);

  // Full title string for OG/Twitter (no template applies there). The <title>
  // uses `absolute` when hand-authored so the root template doesn't double the
  // brand suffix; otherwise a plain string lets the template add "| Dynamic…".
  const ogTitle = seo?.seoTitle ?? `${post.title} | ${SITE_NAME}`;
  const description =
    seo?.seoDescription ?? post.excerpt ?? undefined;
  const canonical = seo?.seoCanonicalUrl ?? url;
  const ogImage = seo?.seoOgImage?.url ?? post.coverImage?.desktop?.url ?? null;
  const authorName = post.author?.name ?? undefined;

  const noIndex = Boolean(seo?.seoNoIndex);
  const noFollow = Boolean(seo?.seoNoFollow);

  return {
    title: seo?.seoTitle ? { absolute: seo.seoTitle } : post.title,
    description,
    alternates: { canonical },
    authors: authorName ? [{ name: authorName }] : undefined,
    openGraph: {
      type: "article",
      url,
      title: ogTitle,
      description,
      siteName: SITE_NAME,
      publishedTime: post.publishedDate ?? undefined,
      authors: authorName ? [authorName] : undefined,
      images: ogImage
        ? [
            {
              url: absoluteUrl(ogImage),
              width: seo?.seoOgImage?.width ?? post.coverImage?.desktop?.width ?? undefined,
              height:
                seo?.seoOgImage?.height ?? post.coverImage?.desktop?.height ?? undefined,
              alt: post.title ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      images: ogImage ? [absoluteUrl(ogImage)] : undefined,
    },
    robots:
      noIndex || noFollow ? { index: !noIndex, follow: !noFollow } : undefined,
  };
}

/**
 * BlogPosting JSON-LD for a post. Uses the SEO entry's custom schema markup if
 * present (editor override), otherwise builds a sensible default from the post.
 */
export function blogPostJsonLd(post: BlogPostEntry): Record<string, unknown> {
  const custom = post.seo?.seoSchemaMarkup;
  if (custom && typeof custom === "object") return custom as Record<string, unknown>;

  const slug = (post.slug ?? "").replace(/^\/+/, "");
  const url = absoluteUrl(`/blog/${slug}`);
  const image = post.seo?.seoOgImage?.url ?? post.coverImage?.desktop?.url ?? undefined;
  // Google recommends headlines ≤ 110 chars; guard against future long titles.
  const headline = (post.title ?? "").slice(0, 110);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description: post.seo?.seoDescription ?? post.excerpt ?? undefined,
    image: image ? [absoluteUrl(image)] : undefined,
    datePublished: post.publishedDate ?? undefined,
    // Last publish time reflects edits; fall back to the published date.
    dateModified: post.sys?.publishedAt ?? post.publishedDate ?? undefined,
    articleSection: post.category ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role ?? undefined,
        }
      : undefined,
    publisher: organizationRef(),
  };
}

/** Publisher/organization reference shared by Article + Organization schema. */
function organizationRef(): Record<string, unknown> {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.png"),
      width: 600,
      height: 189,
    },
  };
}

/**
 * Sitewide Organization schema (rendered once, in the root layout). Establishes
 * the brand entity: name, logo, contact, and linked social profiles.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/logo.png"),
    telephone: BUSINESS.telephone,
    sameAs: BUSINESS.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS.telephone,
      contactType: "customer service",
      areaServed: "LK",
      availableLanguage: ["en", "si"],
    },
  };
}

/**
 * Sitewide WebSite schema with a SearchAction wired to the blog search, so
 * search engines understand the site's search endpoint.
 */
export function webSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * LocalBusiness (gym) schema for the homepage: the most important schema for a
 * local gym — name, address, phone, hours, price range, and service area let
 * search engines and AI assistants recommend Dynamic Fitness for local queries.
 */
export function gymJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["HealthClub", "ExerciseGym"],
    "@id": `${SITE_URL}/#gym`,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    description:
      "Nawinna's premier fitness destination — state-of-the-art equipment, personal training, group classes, and nutrition coaching in Maharagama.",
    url: SITE_URL,
    image: absoluteUrl("/logo.png"),
    logo: absoluteUrl("/logo.png"),
    telephone: BUSINESS.telephone,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: "LKR",
    sameAs: BUSINESS.sameAs,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.locality,
      addressRegion: BUSINESS.address.region,
      addressCountry: BUSINESS.address.country,
    },
    areaServed: [
      { "@type": "City", name: "Maharagama" },
      { "@type": "Place", name: "Nawinna" },
    ],
    openingHoursSpecification: BUSINESS.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}
