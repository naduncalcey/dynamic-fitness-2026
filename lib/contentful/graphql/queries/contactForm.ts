import { richTextJson } from "../fragments/richText";

/**
 * Contact form section by entry id. Holds the editable form copy (heading,
 * rich-text description, success message). The form itself posts to
 * /api/contact, which emails the enquiry via Resend.
 */
export const CONTACT_FORM_BY_ID = /* GraphQL */ `
  query ContactFormById($id: String!, $locale: String, $preview: Boolean) {
    contactForm(id: $id, locale: $locale, preview: $preview) {
      sys {
        id
      }
      internalName
      frontEndComponent
      heading
      ${richTextJson("description")}
      successMessage
    }
  }
`;
