import { defineQuery } from "next-sanity";

/** Images are projected with the fields the frontend needs: `asset` drives the
 * URL builder, `hotspot` drives the full-bleed crop, `alt` is authored. */
const IMAGE_FRAGMENT = /* groq */ `{
  asset->{
    _id,
    metadata { lqip, dimensions }
  },
  hotspot,
  crop,
  alt
}`;

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    seoTitle,
    seoDescription,
    pageBuilder[]{
      _key,
      _type,

      _type == "heroSection" => {
        backgroundImage ${IMAGE_FRAGMENT},
        ratingScore,
        highlights,
        contactCard{ title, personName, personRole, href, avatar ${IMAGE_FRAGMENT} },
        tagline,
        ctas[]{ _key, label, href }
      },

      _type == "aboutSection" => {
        heading,
        blocks[]{ _key, icon, title, copy },
        cta{ label, href },
        videoUrl
      },

      _type == "numbersSection" => {
        stats[]{ _key, value, suffix, label, image ${IMAGE_FRAGMENT} }
      },

      _type == "bannerSection" => {
        image ${IMAGE_FRAGMENT}
      },

      _type == "programsSection" => {
        eyebrow,
        heading,
        subcopy,
        audienceToggle{ individualLabel, coupleLabel },
        contactCard{ title, personName, personRole, href, avatar ${IMAGE_FRAGMENT} },
        programs[]{ _key, audience, eyebrow, title, description, meta, trustedLabel, cta{ label, href } }
      },

      _type == "processSection" => {
        eyebrow,
        heading,
        subcopy,
        steps[]{ _key, icon, title, copy, image ${IMAGE_FRAGMENT} }
      },

      _type == "testimonialsSection" => {
        eyebrow,
        heading,
        subcopy,
        testimonials[]{ _key, quote, name, location, program, image ${IMAGE_FRAGMENT} }
      },

      _type == "faqSection" => {
        eyebrow,
        heading,
        faqs[]{ _key, question, answer },
        videoUrl
      }
    }
  }
`);
