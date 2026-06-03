import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFlexiblePageBySlug } from "@/lib/contentful/pages";
import { getBlogPostBySlug } from "@/lib/contentful/blog";
import { SectionsRenderer } from "@/lib/sections/SectionsRenderer";
import { BlogPostTemplate } from "@/components/templates/BlogPost";
import { splitLocaleFromSlug } from "@/lib/i18n/locale";
import { absoluteUrl, blogPostMetadata, gymJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/common/JsonLd";
import type { SeoEntry } from "@/lib/sections/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const slugPathFrom = (segments: string[]) =>
  segments.length ? `/${segments.join("/")}` : "/";

/** A blog post detail path is `/blog/<slug>`; returns the post slug or null. */
const blogPostSlug = (rest: string[]) =>
  rest.length === 2 && rest[0] === "blog" ? rest[1] : null;

const seoToMetadata = (
  seo: SeoEntry | null | undefined,
  path: string,
  fallbackTitle?: string | null,
  fallbackDescription?: string | null
): Metadata => {
  // A hand-authored seoTitle is used verbatim (absolute) so the root layout's
  // "%s | Dynamic Fitness" template doesn't append a second brand suffix; the
  // fallback page title stays a plain string so the template can add it.
  const title = seo?.seoTitle
    ? { absolute: seo.seoTitle }
    : fallbackTitle ?? undefined;
  const ogTitle = seo?.seoTitle ?? fallbackTitle ?? undefined;
  const description = seo?.seoDescription ?? fallbackDescription ?? undefined;
  const ogImage = seo?.seoOgImage?.url ?? null;
  // Canonical defaults to this page's own absolute URL so every page emits one
  // (helps Google pick the right URL + title), unless an explicit override is set.
  const canonical = seo?.seoCanonicalUrl ?? absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: ogTitle,
      description,
      url: canonical,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: seo?.seoOgImage?.width ?? undefined,
              height: seo?.seoOgImage?.height ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: ogImage
      ? { card: "summary_large_image", title: ogTitle, description, images: [ogImage] }
      : { card: "summary", title: ogTitle, description },
    robots:
      seo?.seoNoIndex || seo?.seoNoFollow
        ? { index: !seo.seoNoIndex, follow: !seo.seoNoFollow }
        : undefined,
  };
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const { locale, rest } = splitLocaleFromSlug(slug);

  const postSlug = blogPostSlug(rest);
  if (postSlug) {
    const post = await getBlogPostBySlug(postSlug, { locale: locale.contentfulCode });
    return post ? blogPostMetadata(post) : {};
  }

  const path = slugPathFrom(rest);
  const page = await getFlexiblePageBySlug(path, {
    locale: locale.contentfulCode,
  });
  return page ? seoToMetadata(page.seo, path, page.pageTitle) : {};
};

export default async function FlexiblePageRoute({ params }: PageProps) {
  const { slug } = await params;
  const { locale, rest } = splitLocaleFromSlug(slug);

  // Blog post detail (/blog/<slug>) → fixed post template.
  const postSlug = blogPostSlug(rest);
  if (postSlug) {
    const post = await getBlogPostBySlug(postSlug, { locale: locale.contentfulCode });
    if (!post) notFound();
    return (
      <main lang={locale.htmlLang}>
        <BlogPostTemplate post={post} />
      </main>
    );
  }

  // Everything else (incl. /blog listing) → FlexiblePage + sections.
  const path = slugPathFrom(rest);
  const page = await getFlexiblePageBySlug(path, {
    locale: locale.contentfulCode,
  });
  if (!page) notFound();

  return (
    <main lang={locale.htmlLang}>
      {/* Homepage carries the LocalBusiness (gym) structured data. */}
      {path === "/" ? <JsonLd data={gymJsonLd()} /> : null}
      <SectionsRenderer sections={page.sections} />
    </main>
  );
}
