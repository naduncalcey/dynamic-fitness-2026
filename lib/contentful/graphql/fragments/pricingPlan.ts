/**
 * Pricing plan — one card in the Info "Info - Pricing" variant. Include this
 * fragment definition exactly once per query document.
 */
export const PRICING_PLAN_FRAGMENT = /* GraphQL */ `
  fragment PricingPlanFields on PricingPlan {
    sys {
      id
    }
    name
    description
    price
    priceSuffix
    features
    isPopular
    ctaLabel
    ctaLink
  }
`;
