import { CTA_FRAGMENT } from "../fragments/cta";
import { IMAGE_FRAGMENT } from "../fragments/image";
import { VIDEO_FRAGMENT } from "../fragments/video";
import { PRICING_PLAN_FRAGMENT } from "../fragments/pricingPlan";
import { richTextField, richTextJson } from "../fragments/richText";

/**
 * Info section by entry id. Reuses the Cta, Image, and PricingPlan fragments.
 * The `frontEndComponent` field selects the visual variant ("Info - Image
 * Explainer" or "Info - Pricing"); the query fetches both variants' fields and
 * the component renders the relevant ones.
 */
export const INFO_BY_ID = /* GraphQL */ `
  ${CTA_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VIDEO_FRAGMENT}
  ${PRICING_PLAN_FRAGMENT}

  query InfoById($id: String!, $locale: String, $preview: Boolean) {
    info(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      sectionNumber
      sectionLabel
      headline
      headlineFaded
      ${richTextJson("description")}
      stats
      ${richTextField("body")}
      imageTooltips
      cta {
        ...CtaFields
      }
      mainImage {
        ...ImageFields
      }
      galleryImagesCollection(limit: 3) {
        items {
          ...ImageFields
        }
      }
      coupleDiscountLabel
      individualPlansCollection(limit: 6) {
        items {
          ...PricingPlanFields
        }
      }
      couplePlansCollection(limit: 6) {
        items {
          ...PricingPlanFields
        }
      }
    }
  }
`;
