/**
 * A single customer review/testimonial card. Referenced by the Testimonial
 * section. Include this fragment definition exactly once per query document.
 *
 * `image` is an optional custom-avatar Image entry; it requires the
 * `ImageFields` fragment (IMAGE_FRAGMENT) to also be present in the query
 * document. When set it overrides the plain `avatarUrl`.
 */
export const REVIEW_FRAGMENT = /* GraphQL */ `
  fragment ReviewFields on Review {
    sys {
      id
    }
    authorName
    avatarUrl
    image {
      ...ImageFields
    }
    rating
    quote
    timeAgo
  }
`;
