import { contentfulFetch } from "@/lib/contentful/client";
import { CAREERS_FORM_BY_ID } from "@/lib/contentful/graphql/queries/careersForm";
import { CareersForm } from "@/components/sections/CareersForm";
import type { SectionDefinition } from "@/lib/sections/config";
import type { CareersFormSection } from "@/lib/sections/types";
import type { RichTextField } from "@/lib/contentful/common/types";

type CareersFormResponse = {
  careersForm?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    heading?: string | null;
    description?: RichTextField | null;
    positions?: Array<string | null> | null;
    successMessage?: string | null;
  } | null;
};

export const careersFormSection: SectionDefinition = {
  contentfulTypename: "CareersForm",
  type: "careersForm",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<CareersFormResponse>(
        CAREERS_FORM_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.careersForm;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "careersForm",
        frontEndComponent: entry.frontEndComponent ?? null,
        heading: entry.heading ?? null,
        description: entry.description ?? null,
        positions: (entry.positions ?? []).filter((p): p is string => typeof p === "string"),
        successMessage: entry.successMessage ?? null,
      } satisfies CareersFormSection;
    } catch (error) {
      console.error(`Failed to hydrate CareersForm (${id}):`, error);
      return null;
    }
  },

  render: (section) => <CareersForm section={section as CareersFormSection} />,
};
