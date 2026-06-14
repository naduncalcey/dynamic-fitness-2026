import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFlexiblePageBySlug } from "@/lib/contentful/pages";
import { getBlogPostBySlug } from "@/lib/contentful/blog";
import { SectionsRenderer } from "@/lib/sections/SectionsRenderer";
import { BlogPostTemplate } from "@/components/templates/BlogPost";
import { splitLocaleFromSlug, LOCALE_MAP, DEFAULT_LOCALE, localizeHref, type LocaleConfig } from "@/lib/i18n/locale";
import { absoluteUrl, blogPostMetadata, gymJsonLd, faqJsonLd, jobPostingsJsonLd, SITE_NAME, ogLocale, ogAlternateLocales, localeAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/common/JsonLd";
import { BackToTop } from "@/components/common/BackToTop";
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

/** Collect job openings from any JobListings sections on the page. */
const collectJobs = (sections: Section[]) =>
  sections
    .filter((s): s is Extract<Section, { type: "jobListings" }> => s.type === "jobListings")
    .flatMap((s) => s.jobs ?? []);

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
  locale: LocaleConfig,
  fallbackTitle?: string | null,
  fallbackDescription?: string | null
): Metadata => {
  // A hand-authored seoTitle is used verbatim (absolute) so the root layout's
  // "%s | Dynamic Fitness" template doesn't append a second brand suffix; the
  // fallback page title stays a plain string so the template can add it.
  const title = seo?.seoTitle
    ? { absolute: seo.seoTitle }
    : fallbackTitle ?? undefined;
  const description = seo?.seoDescription ?? fallbackDescription ?? undefined;
  // Social (OG/Twitter) title + description: editor-set overrides, else reuse
  // the page's SEO title/description.
  const ogTitle = seo?.seoOgTitle ?? seo?.seoTitle ?? fallbackTitle ?? undefined;
  const ogDescription = seo?.seoOgDescription ?? description;
  const ogImage = seo?.seoOgImage?.url ?? null;
  // Canonical defaults to this page's own absolute URL so every page emits one
  // (helps Google pick the right URL + title), unless an explicit override is set.
  const selfUrl = absoluteUrl(localizeHref(path, locale));
  const canonical = seo?.seoCanonicalUrl ?? selfUrl;

  return {
    title,
    description,
    alternates: { canonical, languages: localeAlternates(path) },
    openGraph: {
      type: "website",
      title: ogTitle,
      description: ogDescription,
      url: selfUrl,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
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
      ? { card: "summary_large_image", title: ogTitle, description: ogDescription, images: [ogImage] }
      : { card: "summary", title: ogTitle, description: ogDescription },
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
    return post ? blogPostMetadata(post, locale) : {};
  }

  const path = slugPathFrom(rest);
  const page = await getFlexiblePageBySlug(path, {
    locale: locale.contentfulCode,
  });
  return page ? seoToMetadata(page.seo, path, locale, page.pageTitle) : {};
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
      <main id="main-content" tabIndex={-1} lang={locale.htmlLang}>
        <BlogPostTemplate post={post} locale={locale.urlSlug} />
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
  const jobPostings = jobPostingsJsonLd(collectJobs(page.sections));

  // Sections that render their own <h1> (Hero, the form sections, BlogListing, or
  // an Info article). When a page has none of these, it would ship with no
  // top-level heading (e.g. careers = Banner + Banner + JobListings), so add a
  // visually-hidden <h1> from the page title for a correct document outline.
  const H1_SECTION_TYPES = new Set(["hero", "contactForm", "careersForm", "blogListing"]);
  // Info renders an <h1> only for the headline-led variants; Pricing and
  // Amenities render <h2>, so those don't count as the page's top heading.
  const hasOwnH1 = page.sections.some((s) =>
    s.type === "info"
      ? s.frontEndComponent === "Info - Image Explainer" || s.frontEndComponent === "Info - Default"
      : H1_SECTION_TYPES.has(s.type)
  );

  return (
    <main id="main-content" tabIndex={-1} lang={locale.htmlLang}>
      {!hasOwnH1 && page.pageTitle ? <h1 className="sr-only">{page.pageTitle}</h1> : null}
      {/* Homepage carries the LocalBusiness (gym) structured data. */}
      {path === "/" ? <JsonLd data={gymJsonLd()} /> : null}
      {/* FAQPage structured data when the page has an FAQ accordion. */}
      {faq ? <JsonLd data={faq} /> : null}
      {/* JobPosting structured data, one per open role (e.g. the careers page). */}
      {jobPostings.map((posting, i) => (
        <JsonLd key={`job-${i}`} data={posting} />
      ))}
      {/* Editor-authored custom JSON-LD from the page's SEO entry
          (Contentful `seoSchemaMarkup`), rendered alongside the code-generated
          schema so content editors can add structured data to any page. */}
      {page.seo?.seoSchemaMarkup ? (
        <JsonLd data={page.seo.seoSchemaMarkup as Record<string, unknown>} />
      ) : null}
      <SectionsRenderer sections={page.sections} />
      {page.showBackToTop ? <BackToTop /> : null}
    </main>
  );
}
