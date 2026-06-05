import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFlexiblePageBySlug } from "@/lib/contentful/pages";
import { getBlogPostBySlug } from "@/lib/contentful/blog";
import { SectionsRenderer } from "@/lib/sections/SectionsRenderer";
import { BlogPostTemplate } from "@/components/templates/BlogPost";
import { splitLocaleFromSlug, LOCALE_MAP, DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { absoluteUrl, blogPostMetadata, gymJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/common/JsonLd";
import { getFlexiblePageEntries, getBlogPostEntries } from "@/lib/contentful/sitemap";
import type { Section, SeoEntry } from "@/lib/sections/types";

/** Collect Q&A items from any "Accordion - FAQ" sections on the page. */
const collectFaqItems = (sections: Section[]) =>
  sections
    .filter(
      (s): s is Extract<Section, { type: "accordion" }> =>
        s.type === "accordion" &&
        typeof s.frontEndComponent === "string" &&
        s.frontEndComponent.includes("FAQ")
    )
    .flatMap((s) => s.items ?? []);

// Pages render statically and serve from the Full Route Cache (ISR). The
// Contentful fetches behind them are cached + tagged (see lib/contentful/client),
// and a publish webhook (/api/revalidate) busts that cache on demand — so edits
// appear immediately. This `revalidate` is only the fallback refresh window if a
// webhook is ever missed.
export const revalidate = 3600;

/**
 * Prerender every known page at build time so they're served as static HTML
 * (Full Route Cache + ISR) instead of rendered per request. Without this, a
 * catch-all segment can't be prerendered and stays fully dynamic. Each base path
 * is expanded across locales (default = no prefix, others = `/<urlSlug>/…`).
 *
 * Pages published after the last build (or any noindex pages the sitemap helpers
 * skip) aren't listed here — `dynamicParams` (default true) still renders them
 * on demand, then caches the result, and the publish webhook keeps them fresh.
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const [pages, posts] = await Promise.all([
    getFlexiblePageEntries(),
    getBlogPostEntries(),
  ]);

  // Base paths as segment arrays, no locale prefix. "/" → [], "/careers" → ["careers"].
  const basePaths: string[][] = [
    ...pages.map((p) => p.slug.replace(/^\/+/, "").split("/").filter(Boolean)),
    ...posts.map((post) => ["blog", post.slug.replace(/^\/+/, "")]),
  ];

  return LOCALE_MAP.flatMap((locale) => {
    const prefix = locale.urlSlug === DEFAULT_LOCALE.urlSlug ? [] : [locale.urlSlug];
    return basePaths.map((segs) => ({ slug: [...prefix, ...segs] }));
  });
}

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

  const faq = faqJsonLd(collectFaqItems(page.sections));

  return (
    <main lang={locale.htmlLang}>
      {/* Homepage carries the LocalBusiness (gym) structured data. */}
      {path === "/" ? <JsonLd data={gymJsonLd()} /> : null}
      {/* FAQPage structured data when the page has an FAQ accordion. */}
      {faq ? <JsonLd data={faq} /> : null}
      <SectionsRenderer sections={page.sections} />
    </main>
  );
}
