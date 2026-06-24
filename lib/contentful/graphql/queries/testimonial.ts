import { REVIEW_FRAGMENT } from "../fragments/review";
import { IMAGE_FRAGMENT } from "../fragments/image";

/**
 * Testimonial section by entry id. `frontEndComponent` selects the visual
 * variant ("Testimonial - Default"); the section holds a list of Review
 * entries shown as an auto-rotating quote carousel.
 *
 * IMAGE_FRAGMENT is prepended because ReviewFields references `...ImageFields`
 * for the optional custom-avatar Image entry.
 */
export const TESTIMONIAL_BY_ID = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
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
