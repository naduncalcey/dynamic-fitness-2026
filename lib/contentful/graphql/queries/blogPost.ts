import { SEO_FRAGMENT } from "../fragments/seo";
import { IMAGE_FRAGMENT } from "../fragments/image";
import { VIDEO_FRAGMENT } from "../fragments/video";
import { CTA_FRAGMENT } from "../fragments/cta";
import { AUTHOR_FRAGMENT } from "../fragments/author";
import { BLOG_POST_CARD_FRAGMENT } from "../fragments/blogPostCard";
import { richTextField } from "../fragments/richText";

/**
 * Single blog post by slug — full detail. The `body` rich text pulls its
 * `links` (so embedded Cta/Image/Video resolve), hence the Cta/Image/Video
 * fragments. Also fetches the post's SEO, author, and cover image.
 */
export const BLOG_POST_BY_SLUG = /* GraphQL */ `
  ${SEO_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VIDEO_FRAGMENT}
  ${CTA_FRAGMENT}
  ${AUTHOR_FRAGMENT}

  query BlogPostBySlug($slug: String!, $locale: String, $preview: Boolean) {
    blogPostCollection(where: { slug: $slug }, limit: 1, locale: $locale, preview: $preview) {
      items {
        sys {
          id
          publishedAt
        }
        title
        slug
        excerpt
        category
        publishedDate
        coverImage {
          ...ImageFields
        }
        author {
          ...AuthorFields
        }
        seo {
          ...SeoFields
        }
        ${richTextField("body")}
      }
    }
  }
`;

/**
 * Blog post listing — lightweight cards, newest first.
 */
export const BLOG_POSTS_LIST = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${AUTHOR_FRAGMENT}
  ${BLOG_POST_CARD_FRAGMENT}

  query BlogPostsList($locale: String, $preview: Boolean, $limit: Int) {
    blogPostCollection(
      order: [publishedDate_DESC]
      limit: $limit
      locale: $locale
      preview: $preview
    ) {
      items {
        ...BlogPostCardFields
      }
    }
  }
`;
