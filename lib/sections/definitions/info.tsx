import { contentfulFetch } from "@/lib/contentful/client";
import { INFO_BY_ID } from "@/lib/contentful/graphql/queries/info";
import { Info } from "@/components/sections/Info";
import type { SectionDefinition } from "@/lib/sections/config";
import type { InfoSection, InfoStat } from "@/lib/sections/types";
import type {
  CtaEntry,
  ImageEntry,
  PricingPlanEntry,
  RichTextField,
} from "@/lib/contentful/common/types";

type InfoResponse = {
  info?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    sectionNumber?: string | null;
    sectionLabel?: string | null;
    headline?: string | null;
    headlineFaded?: string | null;
    body?: RichTextField | null;
    description?: RichTextField | null;
    stats?: unknown;
    imageTooltips?: Array<string | null> | null;
    cta?: CtaEntry | null;
    mainImage?: ImageEntry | null;
    galleryImagesCollection?: { items?: Array<ImageEntry | null> | null } | null;
    coupleDiscountLabel?: string | null;
    admissionFeeNote?: string | null;
    individualPlansCollection?: { items?: Array<PricingPlanEntry | null> | null } | null;
    couplePlansCollection?: { items?: Array<PricingPlanEntry | null> | null } | null;
  } | null;
};

const cleanPlans = (items?: Array<PricingPlanEntry | null> | null): PricingPlanEntry[] =>
  (items ?? []).filter((p): p is PricingPlanEntry => p !== null);

// `stats` is a free-form JSON Object field; coerce it to label/value strings and
// drop anything malformed so a bad edit can't break the render.
const cleanStats = (raw: unknown): InfoStat[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
    .map((s) => ({ label: String(s.label ?? ""), value: String(s.value ?? "") }))
    .filter((s) => s.label !== "" || s.value !== "");
};

export const infoSection: SectionDefinition = {
  contentfulTypename: "Info",
  type: "info",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<InfoResponse>(
        INFO_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.info;
      if (!entry) return null;

      return {
        id: entry.sys.id,
        type: "info",
        frontEndComponent: entry.frontEndComponent ?? null,
        sectionNumber: entry.sectionNumber ?? null,
        sectionLabel: entry.sectionLabel ?? null,
        headline: entry.headline ?? null,
        headlineFaded: entry.headlineFaded ?? null,
        body: entry.body ?? null,
        description: entry.description ?? null,
        stats: cleanStats(entry.stats),
        imageTooltips: (entry.imageTooltips ?? []).filter(
          (t): t is string => typeof t === "string"
        ),
        cta: entry.cta ?? null,
        mainImage: entry.mainImage ?? null,
        galleryImages: (entry.galleryImagesCollection?.items ?? []).filter(
          (i): i is ImageEntry => i !== null
        ),
        coupleDiscountLabel: entry.coupleDiscountLabel ?? null,
        admissionFeeNote: entry.admissionFeeNote ?? null,
        individualPlans: cleanPlans(entry.individualPlansCollection?.items),
        couplePlans: cleanPlans(entry.couplePlansCollection?.items),
      } satisfies InfoSection;
    } catch (error) {
      console.error(`Failed to hydrate Info (${id}):`, error);
      return null;
    }
  },

  render: (section) => <Info section={section as InfoSection} />,
};
