/**
 * A single customer review/testimonial card. Referenced by the Testimonial
 * section. Include this fragment definition exactly once per query document.
 */
export const REVIEW_FRAGMENT = /* GraphQL */ `
  fragment ReviewFields on Review {
    sys {
      id
    }
    authorName
    avatarUrl
    rating
    quote
    timeAgo
  }
`;
