import {
  RICH_TEXT_FRAGMENTS,
  richTextField,
} from "../fragments/richText";

/**
 * Hero section by entry id. `RICH_TEXT_FRAGMENTS` provides the CtaFields /
 * ImageFields / VideoFields definitions used by the subheading's rich text
 * links and reused below for backgroundImage, backgroundVideo, and ctas — so
 * each fragment is defined exactly once in this document.
 */
export const HERO_BY_ID = /* GraphQL */ `
  ${RICH_TEXT_FRAGMENTS}

  query HeroById($id: String!, $locale: String, $preview: Boolean) {
    hero(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      eyebrow
      headline
      highlightText
      ${richTextField("subheading")}
      backgroundImage {
        ...ImageFields
      }
      backgroundVideo {
        ...VideoFields
      }
      ctasCollection(limit: 2) {
        items {
          ...CtaFields
        }
      }
    }
  }
`;
