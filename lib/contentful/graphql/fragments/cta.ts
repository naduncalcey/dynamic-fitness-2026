/**
 * Reusable CTA entry. Variants (`Red`, `Gray`) are ported from the previous
 * Dynamic Fitness site's SpotlightButton. The field set is intentionally
 * scalable — add a new `variant`/`size`/`linkBehavior` option in Contentful and
 * the component's switch-case picks it up.
 *
 * Include this fragment definition exactly once per query document.
 */
export const CTA_FRAGMENT = /* GraphQL */ `
  fragment CtaFields on Cta {
    __typename
    sys {
      id
    }
    internalName
    label
    variant
    size
    linkBehavior
    newTab
    showArrow
    fullWidth
    externalLink
    internalLink {
      __typename
      ... on FlexiblePage {
        slug
      }
    }
    downloadableAsset {
      url
    }
  }
`;
