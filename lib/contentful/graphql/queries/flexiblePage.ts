import { SEO_FRAGMENT } from "../fragments/seo";

export const FLEXIBLE_PAGE_BY_SLUG = /* GraphQL */ `
  ${SEO_FRAGMENT}
  query FlexiblePageBySlug($slug: String!, $locale: String, $preview: Boolean) {
    flexiblePageCollection(where: { slug: $slug }, locale: $locale, limit: 1, preview: $preview) {
      items {
        sys {
          id
        }
        slug
        pageTitle
        showBackToTop
        seo {
          ...SeoFields
        }
        sectionsCollection(limit: 20) {
          items {
            __typename
            ... on Entry {
              sys {
                id
              }
            }
          }
        }
      }
    }
  }
`;
