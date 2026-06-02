import type { InfoSection } from "@/lib/sections/types";
import { InfoImageExplainer } from "./InfoImageExplainer";
import { InfoPricing } from "./InfoPricing";
import { InfoDefault } from "./InfoDefault";

/**
 * Info section. Routes to a variant by `frontEndComponent` via switch-case
 * (see components/ARCHITECTURE.md). Add a variant by creating a folder under
 * `components/sections/Info/<Variant>/` and adding a case here.
 */

type InfoProps = {
  section: InfoSection;
};

export function Info({ section }: InfoProps) {
  switch (section.frontEndComponent) {
    case "Info - Image Explainer":
      return <InfoImageExplainer section={section} />;
    case "Info - Pricing":
      return <InfoPricing section={section} />;
    case "Info - Default":
      return <InfoDefault section={section} />;
    default:
      return <InfoImageExplainer section={section} />;
  }
}

export default Info;
