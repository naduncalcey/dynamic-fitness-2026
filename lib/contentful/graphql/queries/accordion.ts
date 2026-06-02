import { CTA_FRAGMENT } from "../fragments/cta";
import { IMAGE_FRAGMENT } from "../fragments/image";
import { VIDEO_FRAGMENT } from "../fragments/video";
import { ACCORDION_ITEM_FRAGMENT } from "../fragments/accordionItem";
import { richTextJson } from "../fragments/richText";

/**
 * Accordion section by entry id. `frontEndComponent` selects the visual variant
 * ("Accordion - FAQ"); the section pairs an intro column (number/label,
 * headline, rich-text description, CTA) with a list of expand/collapse
 * AccordionItems (rich-text answers). Rich text is fetched as json-only to keep
 * the query under Contentful's complexity limit across the items collection.
 */
export const ACCORDION_BY_ID = /* GraphQL */ `
  ${CTA_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VIDEO_FRAGMENT}
  ${ACCORDION_ITEM_FRAGMENT}

  query AccordionById($id: String!, $locale: String, $preview: Boolean) {
    accordion(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      sectionNumber
      sectionLabel
      headline
      ${richTextJson("description")}
      cta {
        ...CtaFields
      }
      itemsCollection(limit: 12) {
        items {
          ...AccordionItemFields
        }
      }
    }
  }
`;
