import { contentfulFetch } from "@/lib/contentful/client";
import { ACCORDION_BY_ID } from "@/lib/contentful/graphql/queries/accordion";
import { Accordion } from "@/components/sections/Accordion";
import type { SectionDefinition } from "@/lib/sections/config";
import type { AccordionSection } from "@/lib/sections/types";
import type {
  AccordionItemEntry,
  CtaEntry,
  RichTextField,
} from "@/lib/contentful/common/types";

type AccordionResponse = {
  accordion?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    sectionNumber?: string | null;
    sectionLabel?: string | null;
    headline?: string | null;
    description?: RichTextField | null;
    cta?: CtaEntry | null;
    itemsCollection?: { items?: Array<AccordionItemEntry | null> | null } | null;
  } | null;
};

export const accordionSection: SectionDefinition = {
  contentfulTypename: "Accordion",
  type: "accordion",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<AccordionResponse>(
        ACCORDION_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.accordion;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "accordion",
        frontEndComponent: entry.frontEndComponent ?? null,
        sectionNumber: entry.sectionNumber ?? null,
        sectionLabel: entry.sectionLabel ?? null,
        headline: entry.headline ?? null,
        description: entry.description ?? null,
        cta: entry.cta ?? null,
        items: (entry.itemsCollection?.items ?? []).filter(
          (i): i is AccordionItemEntry => i !== null
        ),
      } satisfies AccordionSection;
    } catch (error) {
      console.error(`Failed to hydrate Accordion (${id}):`, error);
      return null;
    }
  },

  render: (section) => <Accordion section={section as AccordionSection} />,
};
