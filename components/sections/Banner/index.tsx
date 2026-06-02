import type { BannerSection } from "@/lib/sections/types";
import { BannerCta } from "./BannerCta";

/**
 * Banner section. Routes to a variant by `frontEndComponent` via switch-case
 * (see components/ARCHITECTURE.md).
 */

type BannerProps = {
  section: BannerSection;
};

export function Banner({ section }: BannerProps) {
  switch (section.frontEndComponent) {
    case "Banner - CTA":
      return <BannerCta section={section} />;
    default:
      return <BannerCta section={section} />;
  }
}

export default Banner;
