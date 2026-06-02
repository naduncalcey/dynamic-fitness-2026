import type { HeroSection } from "@/lib/sections/types";
import { HeroDefault } from "./HeroDefault";

/**
 * Hero section. Routes to a variant by the `frontEndComponent` field using a
 * switch-case (see components/ARCHITECTURE.md — variant routing is switch-case,
 * not a component map). Add a variant by creating a folder under
 * `components/sections/Hero/<Variant>/` and adding a case here.
 */

type HeroProps = {
  section: HeroSection;
};

export function Hero({ section }: HeroProps) {
  switch (section.frontEndComponent) {
    case "Hero - default":
      return <HeroDefault section={section} />;
    default:
      return <HeroDefault section={section} />;
  }
}

export default Hero;
