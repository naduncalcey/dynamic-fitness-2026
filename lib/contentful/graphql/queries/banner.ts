import { CTA_FRAGMENT } from "../fragments/cta";
import { IMAGE_FRAGMENT } from "../fragments/image";
import { richTextJson } from "../fragments/richText";

/**
 * Banner section by entry id. Reuses the Cta and Image fragments.
 * `frontEndComponent` selects the visual variant ("Banner - CTA").
 */
export const BANNER_BY_ID = /* GraphQL */ `
  ${CTA_FRAGMENT}
  ${IMAGE_FRAGMENT}

  query BannerById($id: String!, $locale: String, $preview: Boolean) {
    banner(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      headline
      highlightWord
      ${richTextJson("description")}
      cta {
        ...CtaFields
      }
      backgroundImage {
        ...ImageFields
      }
    }
  }
`;
