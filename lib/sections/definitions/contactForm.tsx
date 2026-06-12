import { contentfulFetch } from "@/lib/contentful/client";
import { CONTACT_FORM_BY_ID } from "@/lib/contentful/graphql/queries/contactForm";
import { ContactForm } from "@/components/sections/ContactForm";
import type { SectionDefinition } from "@/lib/sections/config";
import type { ContactFormSection } from "@/lib/sections/types";
import type { RichTextField } from "@/lib/contentful/common/types";

type ContactFormResponse = {
  contactForm?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    heading?: string | null;
    description?: RichTextField | null;
    successMessage?: string | null;
  } | null;
};

export const contactFormSection: SectionDefinition = {
  contentfulTypename: "ContactForm",
  type: "contactForm",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<ContactFormResponse>(
        CONTACT_FORM_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.contactForm;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "contactForm",
        frontEndComponent: entry.frontEndComponent ?? null,
        heading: entry.heading ?? null,
        description: entry.description ?? null,
        successMessage: entry.successMessage ?? null,
      } satisfies ContactFormSection;
    } catch (error) {
      console.error(`Failed to hydrate ContactForm (${id}):`, error);
      return null;
    }
  },

  render: (section) => <ContactForm section={section as ContactFormSection} />,
};
