import { richTextJson } from "../fragments/richText";

/**
 * Careers form section by entry id. Holds the editable form copy (heading,
 * rich-text description, position options, success message). The form itself
 * posts to /api/careers, which emails the application + CV via Resend.
 */
export const CAREERS_FORM_BY_ID = /* GraphQL */ `
  query CareersFormById($id: String!, $locale: String, $preview: Boolean) {
    careersForm(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      heading
      ${richTextJson("description")}
      positions
      successMessage
    }
  }
`;
