import type { ImageEntry, RichTextField } from "@/lib/contentful/common/types";
import type { SeoEntry } from "@/lib/sections/types";

export type AuthorEntry = {
  sys: { id: string };
  name?: string | null;
  role?: string | null;
  /** External image URL fallback. */
  avatarUrl?: string | null;
  /** Uploaded Contentful asset; takes precedence over `avatarUrl`. */
  avatarImage?: { url?: string | null } | null;
};

/**
 * The effective avatar URL for an author: an uploaded image asset wins over the
 * external URL link, so editors can use whichever they prefer.
 */
export function authorAvatarUrl(
  author: Pick<AuthorEntry, "avatarUrl" | "avatarImage"> | null | undefined
): string | null {
  return author?.avatarImage?.url ?? author?.avatarUrl ?? null;
}

/** Lightweight fields for listing cards. */
export type BlogPostCard = {
  sys: { id: string };
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  category?: string | null;
  publishedDate?: string | null;
  coverImage?: ImageEntry | null;
  author?: AuthorEntry | null;
};

/** Full post for the detail template. */
export type BlogPostEntry = BlogPostCard & {
  /** `publishedAt` (last publish time) backs the structured-data dateModified. */
  sys: { id: string; publishedAt?: string | null };
  seo?: SeoEntry | null;
  body?: RichTextField | null;
};
