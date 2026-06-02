import { richTextJson } from "../fragments/richText";

/**
 * Blog listing section by entry id — provides the section's heading/intro. The
 * posts themselves are fetched separately (getBlogPosts) during hydration so
 * the listing always shows the newest published posts.
 */
export const BLOG_LISTING_BY_ID = /* GraphQL */ `
  query BlogListingById($id: String!, $locale: String, $preview: Boolean) {
    blogListing(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      heading
      ${richTextJson("description")}
    }
  }
`;
