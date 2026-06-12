import type { ContactFormSection } from "@/lib/sections/types";
import { ContactFormDefault } from "./ContactFormDefault";

/**
 * Contact form section. Routes to a variant by `frontEndComponent` via
 * switch-case (see components/ARCHITECTURE.md).
 */

type ContactFormProps = {
  section: ContactFormSection;
};

export function ContactForm({ section }: ContactFormProps) {
  switch (section.frontEndComponent) {
    case "Contact Form":
      return <ContactFormDefault section={section} />;
    default:
      return <ContactFormDefault section={section} />;
  }
}

export default ContactForm;
