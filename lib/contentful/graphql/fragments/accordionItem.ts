import { richTextJson } from "./richText";

/**
 * A single accordion item (question + rich-text answer). The answer is fetched
 * as `json` only (FAQ answers are prose and won't embed entries), keeping query
 * cost low across the items collection. Include this fragment definition exactly
 * once per query document.
 */
export const ACCORDION_ITEM_FRAGMENT = /* GraphQL */ `
  fragment AccordionItemFields on AccordionItem {
    sys {
      id
    }
    question
    ${richTextJson("answer")}
    image {
      ...ImageFields
    }
    video {
      ...VideoFields
    }
    cta {
      ...CtaFields
    }
  }
`;
