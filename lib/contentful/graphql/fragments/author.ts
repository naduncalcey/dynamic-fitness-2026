/**
 * Blog author. Referenced by blog posts. avatarUrl is an external image URL
 * (kept as a Symbol — no Contentful asset required). Include this fragment
 * definition exactly once per query document.
 */
export const AUTHOR_FRAGMENT = /* GraphQL */ `
  fragment AuthorFields on Author {
    sys {
      id
    }
    name
    role
    avatarUrl
  }
`;
