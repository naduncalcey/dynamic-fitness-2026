import { contentfulFetch } from "@/lib/contentful/client";
import { BLOG_POST_BY_SLUG, BLOG_POSTS_LIST } from "@/lib/contentful/graphql/queries/blogPost";
import type { BlogPostCard, BlogPostEntry } from "./types";

type FetchOptions = {
  preview?: boolean;
  locale?: string;
};

/** Fetch a single blog post by slug (full detail), or null if not found. */
export async function getBlogPostBySlug(
  slug: string,
  options: FetchOptions = {}
): Promise<BlogPostEntry | null> {
  // Blog slugs are bare (e.g. "first-week-at-the-gym"), but an editor may
  // mistakenly enter a leading slash copying the flexiblePage path convention.
  // Normalize so both "slug" and "/slug" resolve to the same post.
  const normalized = slug.replace(/^\/+/, "");
  try {
    const data = await contentfulFetch<{
      blogPostCollection?: { items?: Array<BlogPostEntry | null> };
    }>(
      BLOG_POST_BY_SLUG,
      { slug: normalized, locale: options.locale, preview: options.preview ?? false },
      { preview: options.preview }
    );
    return data.blogPostCollection?.items?.[0] ?? null;
  } catch (error) {
    console.error(`Failed to fetch blog post "${slug}":`, error);
    return null;
  }
}

/** Fetch blog post cards, newest first. */
export async function getBlogPosts(
  options: FetchOptions & { limit?: number } = {}
): Promise<BlogPostCard[]> {
  try {
    const data = await contentfulFetch<{
      blogPostCollection?: { items?: Array<BlogPostCard | null> };
    }>(
      BLOG_POSTS_LIST,
      { locale: options.locale, preview: options.preview ?? false, limit: options.limit ?? 24 },
      { preview: options.preview }
    );
    return (data.blogPostCollection?.items ?? []).filter((p): p is BlogPostCard => p !== null);
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return [];
  }
}
