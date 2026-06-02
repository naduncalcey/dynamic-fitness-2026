import { contentfulFetch } from "@/lib/contentful/client";
import { TESTIMONIAL_BY_ID } from "@/lib/contentful/graphql/queries/testimonial";
import { Testimonial } from "@/components/sections/Testimonial";
import type { SectionDefinition } from "@/lib/sections/config";
import type { TestimonialSection } from "@/lib/sections/types";
import type { ReviewEntry } from "@/lib/contentful/common/types";

type TestimonialResponse = {
  testimonial?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    testimonialsCollection?: { items?: Array<ReviewEntry | null> | null } | null;
  } | null;
};

export const testimonialSection: SectionDefinition = {
  contentfulTypename: "Testimonial",
  type: "testimonial",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<TestimonialResponse>(
        TESTIMONIAL_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.testimonial;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "testimonial",
        frontEndComponent: entry.frontEndComponent ?? null,
        reviews: (entry.testimonialsCollection?.items ?? []).filter(
          (r): r is ReviewEntry => r !== null
        ),
      } satisfies TestimonialSection;
    } catch (error) {
      console.error(`Failed to hydrate Testimonial (${id}):`, error);
      return null;
    }
  },

  render: (section) => <Testimonial section={section as TestimonialSection} />,
};
