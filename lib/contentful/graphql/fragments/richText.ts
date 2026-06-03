import { CTA_FRAGMENT } from "./cta";
import { IMAGE_FRAGMENT } from "./image";
import { VIDEO_FRAGMENT } from "./video";

/**
 * Rich Text on Contentful's GraphQL API is queried as `{ json, links }`, where
 * `links` resolves every entry/asset embedded in the document. Contentful
 * generates a *field-specific* `<Type><Field>Links` type, so this cannot be a
 * named GraphQL fragment — it is a raw selection set inlined into each rich text
 * field instead. See `richTextField()` below.
 *
 * Embedded entries (`block`/`inline`) resolve to our reusable Cta / Image /
 * Video components; embedded assets (`assets.block`) resolve to images or file
 * links. See `components/common/RichText`.
 */
export const RICH_TEXT_LINKS = /* GraphQL */ `
  links {
    entries {
      block {
        __typename
        sys {
          id
        }
        ...CtaFields
        ...ImageFields
        ...VideoFields
      }
      inline {
        __typename
        sys {
          id
        }
        ...CtaFields
      }
      hyperlink {
        __typename
        sys {
          id
        }
        ... on FlexiblePage {
          slug
        }
      }
    }
    assets {
      block {
        sys {
          id
        }
        url
        title
        description
        width
        height
        contentType
      }
      hyperlink {
        sys {
          id
        }
        url
        title
        description
        contentType
      }
    }
  }
`;

/**
 * Build the selection set for a Rich Text field, including the `links` payload
 * needed to resolve embedded entries/assets. Use for fields that may embed
 * Cta/Image/Video (e.g. the Info `body` content pages). Spread into a query
 * body, e.g. `${richTextField("body")}`.
 */
export const richTextField = (fieldName: string) => /* GraphQL */ `
  ${fieldName} {
    json
    ${RICH_TEXT_LINKS}
  }
`;

/**
 * Lightweight Rich Text selection — `json` only, no `links`. Use for prose
 * fields that won't embed entries/assets (descriptions, FAQ answers). Avoids the
 * heavy `links` cost, which otherwise multiplies across collections and can trip
 * Contentful's query-complexity limit. Marks/headings/lists/external & mailto
 * links all live in `json`, so they still render.
 */
export const richTextJson = (fieldName: string) => /* GraphQL */ `
  ${fieldName} {
    json
  }
`;

/**
 * The fragment definitions that `RICH_TEXT_LINKS` depends on. Prepend this once
 * to any query that uses `richTextField()` so `...CtaFields`, `...ImageFields`,
 * and `...VideoFields` resolve. If the same query also embeds these fragments
 * elsewhere, include them only once to avoid duplicate-fragment errors.
 */
export const RICH_TEXT_FRAGMENTS = [CTA_FRAGMENT, IMAGE_FRAGMENT, VIDEO_FRAGMENT].join("\n");
