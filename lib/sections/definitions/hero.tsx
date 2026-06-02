import { contentfulFetch } from "@/lib/contentful/client";
import { HERO_BY_ID } from "@/lib/contentful/graphql/queries/hero";
import { Hero } from "@/components/sections/Hero";
import type { SectionDefinition } from "@/lib/sections/config";
import type { HeroSection } from "@/lib/sections/types";
import type {
  CtaEntry,
  ImageEntry,
  RichTextField,
  VideoEntry,
} from "@/lib/contentful/common/types";

type HeroResponse = {
  hero?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    eyebrow?: string | null;
    headline?: string | null;
    highlightText?: string | null;
    subheading?: RichTextField | null;
    backgroundImage?: ImageEntry | null;
    backgroundVideo?: VideoEntry | null;
    ctasCollection?: { items?: Array<CtaEntry | null> | null } | null;
  } | null;
};

export const heroSection: SectionDefinition = {
  contentfulTypename: "Hero",
  type: "hero",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<HeroResponse>(
        HERO_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.hero;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "hero",
        frontEndComponent: entry.frontEndComponent ?? null,
        eyebrow: entry.eyebrow ?? null,
        headline: entry.headline ?? null,
        highlightText: entry.highlightText ?? null,
        subheading: entry.subheading ?? null,
        backgroundImage: entry.backgroundImage ?? null,
        backgroundVideo: entry.backgroundVideo ?? null,
        ctas: (entry.ctasCollection?.items ?? []).filter(
          (c): c is CtaEntry => c !== null
        ),
      } satisfies HeroSection;
    } catch (error) {
      console.error(`Failed to hydrate Hero (${id}):`, error);
      return null;
    }
  },

  render: (section) => <Hero section={section as HeroSection} />,
};
