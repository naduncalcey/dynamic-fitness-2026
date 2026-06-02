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

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo?.seoDescription ?? post.excerpt ?? undefined,
    image: image ? [absoluteUrl(image)] : undefined,
    datePublished: post.publishedDate ?? undefined,
    dateModified: post.publishedDate ?? undefined,
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
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.svg"),
      },
    },
  };
}
