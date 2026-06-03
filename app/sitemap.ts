import type { MetadataRoute } from "next";
import { getBlogPostEntries, getFlexiblePageEntries } from "@/lib/contentful/sitemap";
import { absoluteUrl } from "@/lib/seo";

/**
 * Contentful-driven sitemap at /sitemap.xml. Pulls flexible-page + blog-post
 * slugs (minimal fields, noindex-aware) and maps them to absolute URLs with a
 * real `lastModified` from Contentful's publish time. Revalidated hourly so we
 * don't re-query Contentful on every crawler hit.
 */

export const revalidate = 3600;

/** Home is highest priority; blog posts a touch lower than core pages. */
function rankFor(path: string): Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority"> {
  if (path === "/") return { changeFrequency: "weekly", priority: 1 };
  if (path === "/blog") return { changeFrequency: "daily", priority: 0.8 };
  if (path.startsWith("/blog/")) return { changeFrequency: "monthly", priority: 0.6 };
  return { changeFrequency: "monthly", priority: 0.7 };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([
    getFlexiblePageEntries(),
    getBlogPostEntries(),
  ]);

  // Flexible-page slugs are full paths ("/", "/careers"); blog slugs are bare.
  const paths = new Map<string, string | null>();
  for (const p of pages) {
    const path = p.slug.startsWith("/") ? p.slug : `/${p.slug}`;
    paths.set(path, p.lastModified ?? null);
  }
  for (const post of posts) {
    const path = `/blog/${post.slug.replace(/^\/+/, "")}`;
    paths.set(path, post.lastModified ?? null);
  }

  // Always include the homepage even if Contentful is briefly unreachable.
  if (!paths.has("/")) paths.set("/", null);

  return [...paths.entries()].map(([path, lastModified]) => ({
    url: absoluteUrl(path),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    ...rankFor(path),
  }));
}
