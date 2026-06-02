import { REVIEW_FRAGMENT } from "../fragments/review";

/**
 * Testimonial section by entry id. `frontEndComponent` selects the visual
 * variant ("Testimonial - Default"); the section holds a list of Review
 * entries shown as an auto-rotating quote carousel.
 */
export const TESTIMONIAL_BY_ID = /* GraphQL */ `
  ${REVIEW_FRAGMENT}

  query TestimonialById($id: String!, $locale: String, $preview: Boolean) {
    testimonial(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      testimonialsCollection(limit: 12) {
        items {
          ...ReviewFields
        }
      }
    }
  }
`;
