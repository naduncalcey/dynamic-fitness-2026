import type { AccordionSection } from "@/lib/sections/types";
import { AccordionFaq } from "./AccordionFaq";
import { AccordionSteps } from "./AccordionSteps";

/**
 * Accordion section. Routes to a variant by `frontEndComponent` via switch-case
 * (see components/ARCHITECTURE.md).
 */

type AccordionProps = {
  section: AccordionSection;
};

export function Accordion({ section }: AccordionProps) {
  switch (section.frontEndComponent) {
    case "Accordion - FAQ":
      return <AccordionFaq section={section} />;
    case "Accordion - Steps":
      return <AccordionSteps section={section} />;
    default:
      return <AccordionFaq section={section} />;
  }
}

export default Accordion;
