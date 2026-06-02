import type { TestimonialSection } from "@/lib/sections/types";
import { TestimonialDefault } from "./TestimonialDefault";

/**
 * Testimonial section. Routes to a variant by `frontEndComponent` via
 * switch-case (see components/ARCHITECTURE.md).
 */

type TestimonialProps = {
  section: TestimonialSection;
};

export function Testimonial({ section }: TestimonialProps) {
  switch (section.frontEndComponent) {
    case "Testimonial - Default":
      return <TestimonialDefault section={section} />;
    default:
      return <TestimonialDefault section={section} />;
  }
}

export default Testimonial;
