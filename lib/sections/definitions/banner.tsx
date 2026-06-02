import { contentfulFetch } from "@/lib/contentful/client";
import { BANNER_BY_ID } from "@/lib/contentful/graphql/queries/banner";
import { Banner } from "@/components/sections/Banner";
import type { SectionDefinition } from "@/lib/sections/config";
import type { BannerSection } from "@/lib/sections/types";
import type { CtaEntry, ImageEntry, RichTextField } from "@/lib/contentful/common/types";

type BannerResponse = {
  banner?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    headline?: string | null;
    highlightWord?: string | null;
    description?: RichTextField | null;
    cta?: CtaEntry | null;
    backgroundImage?: ImageEntry | null;
  } | null;
};

export const bannerSection: SectionDefinition = {
  contentfulTypename: "Banner",
  type: "banner",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<BannerResponse>(
        BANNER_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.banner;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "banner",
        frontEndComponent: entry.frontEndComponent ?? null,
        headline: entry.headline ?? null,
        highlightWord: entry.highlightWord ?? null,
        description: entry.description ?? null,
        cta: entry.cta ?? null,
        backgroundImage: entry.backgroundImage ?? null,
      } satisfies BannerSection;
    } catch (error) {
      console.error(`Failed to hydrate Banner (${id}):`, error);
      return null;
    }
  },

  render: (section) => <Banner section={section as BannerSection} />,
};
