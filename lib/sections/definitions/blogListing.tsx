import { contentfulFetch } from "@/lib/contentful/client";
import { BLOG_LISTING_BY_ID } from "@/lib/contentful/graphql/queries/blogListing";
import { getBlogPosts } from "@/lib/contentful/blog";
import { BlogListing } from "@/components/sections/BlogListing";
import type { SectionDefinition } from "@/lib/sections/config";
import type { BlogListingSection } from "@/lib/sections/types";
import type { RichTextField } from "@/lib/contentful/common/types";

type BlogListingResponse = {
  blogListing?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    heading?: string | null;
    description?: RichTextField | null;
  } | null;
};

export const blogListingSection: SectionDefinition = {
  contentfulTypename: "BlogListing",
  type: "blogListing",

  hydrate: async (id, options) => {
    try {
      const [data, posts] = await Promise.all([
        contentfulFetch<BlogListingResponse>(
          BLOG_LISTING_BY_ID,
          { id, locale: options.locale, preview: options.preview ?? false },
          { preview: options.preview }
        ),
        getBlogPosts({ locale: options.locale, preview: options.preview, limit: 24 }),
      ]);
      const entry = data.blogListing;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "blogListing",
        frontEndComponent: entry.frontEndComponent ?? null,
        heading: entry.heading ?? null,
        description: entry.description ?? null,
        posts,
      } satisfies BlogListingSection;
    } catch (error) {
      console.error(`Failed to hydrate BlogListing (${id}):`, error);
      return null;
    }
  },

  render: (section) => <BlogListing section={section as BlogListingSection} />,
};
