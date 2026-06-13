import { contentfulFetch } from "@/lib/contentful/client";
import { JOB_LISTINGS_BY_ID } from "@/lib/contentful/graphql/queries/jobListings";
import { JobListings } from "@/components/sections/JobListings";
import type { SectionDefinition } from "@/lib/sections/config";
import type { JobEntry, JobListingsSection } from "@/lib/sections/types";
import type { RichTextField } from "@/lib/contentful/common/types";

type JobItem = {
  sys: { id: string };
  title?: string | null;
  slug?: string | null;
  employmentType?: string | null;
  location?: string | null;
  department?: string | null;
  summary?: string | null;
  description?: RichTextField | null;
  responsibilities?: Array<string | null> | null;
  requirements?: Array<string | null> | null;
  compensation?: string | null;
  postedDate?: string | null;
};

type JobListingsResponse = {
  jobListings?: {
    sys: { id: string };
    frontEndComponent?: string | null;
    heading?: string | null;
    description?: RichTextField | null;
    emptyMessage?: string | null;
  } | null;
  jobCollection?: { items?: Array<JobItem | null> | null } | null;
};

const toStrings = (arr: Array<string | null> | null | undefined): string[] =>
  (arr ?? []).filter((s): s is string => typeof s === "string");

export const jobListingsSection: SectionDefinition = {
  contentfulTypename: "JobListings",
  type: "jobListings",

  hydrate: async (id, options) => {
    try {
      const data = await contentfulFetch<JobListingsResponse>(
        JOB_LISTINGS_BY_ID,
        { id, locale: options.locale, preview: options.preview ?? false },
        { preview: options.preview }
      );
      const entry = data.jobListings;
      if (!entry) return null;

      const jobs: JobEntry[] = (data.jobCollection?.items ?? [])
        .filter((j): j is JobItem => j !== null)
        .map((j) => ({
          id: j.sys.id,
          title: j.title ?? null,
          slug: j.slug ?? null,
          employmentType: j.employmentType ?? null,
          location: j.location ?? null,
          department: j.department ?? null,
          summary: j.summary ?? null,
          description: j.description ?? null,
          responsibilities: toStrings(j.responsibilities),
          requirements: toStrings(j.requirements),
          compensation: j.compensation ?? null,
          postedDate: j.postedDate ?? null,
        }));

      return {
        id: entry.sys.id,
        type: "jobListings",
        frontEndComponent: entry.frontEndComponent ?? null,
        heading: entry.heading ?? null,
        description: entry.description ?? null,
        emptyMessage: entry.emptyMessage ?? null,
        jobs,
      } satisfies JobListingsSection;
    } catch (error) {
      console.error(`Failed to hydrate JobListings (${id}):`, error);
      return null;
    }
  },

  render: (section) => <JobListings section={section as JobListingsSection} />,
};
