/**
 * Lightweight blog post fields for listing cards (no body). References the
 * Author and Image fragments — a query using this must also define those.
 * Include this fragment definition exactly once per query document.
 */
export const BLOG_POST_CARD_FRAGMENT = /* GraphQL */ `
  fragment BlogPostCardFields on BlogPost {
    sys {
      id
    }
    title
    slug
    excerpt
    category
    publishedDate
    coverImage {
      ...ImageFields
    }
    author {
      ...AuthorFields
    }
  }
`;
