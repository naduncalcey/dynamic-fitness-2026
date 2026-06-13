import type { JobListingsSection } from "@/lib/sections/types";
import { JobListingsDefault } from "./JobListingsDefault";

/**
 * Job Listings section. Routes to a variant by `frontEndComponent` via
 * switch-case (see components/ARCHITECTURE.md).
 */

type JobListingsProps = {
  section: JobListingsSection;
};

export function JobListings({ section }: JobListingsProps) {
  switch (section.frontEndComponent) {
    case "Job Listings":
      return <JobListingsDefault section={section} />;
    default:
      return <JobListingsDefault section={section} />;
  }
}

export default JobListings;
