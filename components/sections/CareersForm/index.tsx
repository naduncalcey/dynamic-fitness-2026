import type { CareersFormSection } from "@/lib/sections/types";
import { CareersFormDefault } from "./CareersFormDefault";

/**
 * Careers form section. Routes to a variant by `frontEndComponent` via
 * switch-case (see components/ARCHITECTURE.md).
 */

type CareersFormProps = {
  section: CareersFormSection;
};

export function CareersForm({ section }: CareersFormProps) {
  switch (section.frontEndComponent) {
    case "Careers Form":
      return <CareersFormDefault section={section} />;
    default:
      return <CareersFormDefault section={section} />;
  }
}

export default CareersForm;
