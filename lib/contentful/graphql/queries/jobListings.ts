import { richTextJson } from "../fragments/richText";

/**
 * Job Listings section by entry id. Fetches the section's editable copy
 * (heading, intro, empty message) plus every published `job`, newest first, in a
 * single request. New jobs published in Contentful appear automatically — the
 * section references no jobs explicitly. Apply forms post to /api/careers.
 */
export const JOB_LISTINGS_BY_ID = /* GraphQL */ `
  query JobListingsById($id: String!, $locale: String, $preview: Boolean) {
    jobListings(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      heading
      ${richTextJson("description")}
      emptyMessage
    }
    jobCollection(
      locale: $locale
      preview: $preview
      order: [postedDate_DESC, sys_firstPublishedAt_DESC]
      limit: 50
    ) {
      items {
        sys {
          id
        }
        title
        slug
        employmentType
        location
        department
        summary
        ${richTextJson("description")}
        responsibilities
        requirements
        compensation
        postedDate
      }
    }
  }
`;
