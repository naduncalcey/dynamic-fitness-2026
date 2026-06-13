import { CTA_FRAGMENT } from "../fragments/cta";
import { IMAGE_FRAGMENT } from "../fragments/image";
import { AUTHOR_FRAGMENT } from "../fragments/author";
import { richTextJson } from "../fragments/richText";

/**
 * Banner section by entry id. Reuses the Cta, Image, and Author fragments.
 * `frontEndComponent` selects the visual variant:
 *   - "Banner - CTA"  → cta + backgroundImage
 *   - "Banner / Team" → teamMembers (Author entries rendered as cards)
 * Both variants are fetched in one query; unused fields come back null/empty.
 */
export const BANNER_BY_ID = /* GraphQL */ `
  ${CTA_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${AUTHOR_FRAGMENT}

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
      teamMembersCollection(limit: 12) {
        items {
          ...AuthorFields
        }
      }
    }
  }
`;
