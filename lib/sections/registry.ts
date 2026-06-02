import type { SectionDefinition } from "./config";
import { heroSection } from "./definitions/hero";
import { infoSection } from "./definitions/info";
import { testimonialSection } from "./definitions/testimonial";
import { accordionSection } from "./definitions/accordion";
import { bannerSection } from "./definitions/banner";
import { careersFormSection } from "./definitions/careersForm";
import { blogListingSection } from "./definitions/blogListing";

/**
 * Central section registry.
 *
 * To add a section, create:
 *   - components/sections/YourSection/index.tsx
 *   - lib/sections/definitions/yourSection.tsx (hydrate + render)
 * …then import and append the definition here.
 *
 * See `components/ARCHITECTURE.md` for the full walkthrough and the
 * switch-case mental model used inside variant routers.
 */
export const sectionRegistry: SectionDefinition[] = [
  heroSection,
  infoSection,
  testimonialSection,
  accordionSection,
  bannerSection,
  careersFormSection,
  blogListingSection,
];
