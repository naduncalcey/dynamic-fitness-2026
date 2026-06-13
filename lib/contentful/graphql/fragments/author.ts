/**
 * Blog author (also reused for team-member cards). The avatar can be set two
 * ways — `avatarImage` (an uploaded Contentful asset) takes precedence over
 * `avatarUrl` (an external image URL Symbol). Resolve the effective URL with
 * `authorAvatarUrl()`. Include this fragment definition exactly once per query
 * document.
 */
export const AUTHOR_FRAGMENT = /* GraphQL */ `
  fragment AuthorFields on Author {
    sys {
      id
    }
    name
    role
    avatarUrl
    avatarImage {
      url
    }
  }
`;
