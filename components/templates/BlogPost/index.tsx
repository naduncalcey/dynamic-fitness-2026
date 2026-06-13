import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { RichText } from "@/components/common/RichText";
import { formatBlogDate } from "@/components/blog/formatBlogDate";
import { BackToBlogLink } from "./BackToBlogLink";
import { blogPostJsonLd } from "@/lib/seo";
import { authorAvatarUrl, type BlogPostEntry } from "@/lib/contentful/blog/types";

/**
 * Blog post detail template (fixed layout, not section-driven): a header with
 * back link, category, title, author/date, the cover image, then the rich-text
 * body in a readable column. Reuses the shared RichText / ResponsiveImage.
 */

type BlogPostTemplateProps = {
  post: BlogPostEntry;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

export function BlogPostTemplate({ post }: BlogPostTemplateProps) {
  const { title, category, publishedDate, author, coverImage, body } = post;
  const date = formatBlogDate(publishedDate);
  const jsonLd = blogPostJsonLd(post);

  return (
    <article className="w-full border-t border-white/20 bg-black">
      <script
        type="application/ld+json"
        // BlogPosting structured data for rich results.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={`pt-[60px] md:pt-[80px] lg:pt-[100px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
        <div className="mx-auto max-w-3xl">
          <BackToBlogLink />

          {category ? (
            <span className="mt-6 block w-fit rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-red-400">
              {category}
            </span>
          ) : null}

          <h1 className="mt-4 text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <div className="mt-6 flex items-center gap-3 text-sm text-white/50">
            {authorAvatarUrl(author) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorAvatarUrl(author)!}
                alt={author?.name ?? ""}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-x-2">
              {author?.name ? <span className="text-white/80">{author.name}</span> : null}
              {author?.role ? <span className="text-white/40">· {author.role}</span> : null}
              {date ? <span className="text-white/40">· {date}</span> : null}
            </div>
          </div>
        </div>

        {coverImage ? (
          <ResponsiveImage
            image={coverImage}
            className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl"
            imgClassName="h-auto w-full object-cover"
            sizes="(max-width: 1240px) 100vw, 900px"
            priority
          />
        ) : null}
      </div>

      {/* Body */}
      <div className={`pb-[80px] pt-12 md:pb-[120px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
        {body ? (
          <RichText
            content={body}
            className="mx-auto max-w-3xl text-base leading-relaxed [&_a]:text-red-400 [&_a]:underline [&_p]:text-gray-300"
          />
        ) : null}
      </div>
    </article>
  );
}

export default BlogPostTemplate;
