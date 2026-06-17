import Link from "next/link";
import { getBlogPostEntries, getFlexiblePageEntries } from "@/lib/contentful/sitemap";
import { localizeHref, type LocaleConfig } from "@/lib/i18n/locale";

/**
 * Shared body of the human-readable HTML sitemap. Rendered at the fixed
 * `/sitemap` route (app/sitemap/page.tsx, default locale) and at
 * `/<locale>/sitemap` via the catch-all route, so both locales resolve instead
 * of 404ing. Internal links are localized to the active locale; the page list
 * itself comes from the same Contentful helpers that feed /sitemap.xml.
 */

type SitemapLink = { href: string; label: string };

/** Turn a slug segment into a readable label when no Contentful title exists. */
function humanize(path: string): string {
  const segment = path.replace(/^\/+|\/+$/g, "").split("/").pop() ?? "";
  if (!segment) return "Home";
  return segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function SitemapView({ locale }: { locale: LocaleConfig }) {
  const [pages, posts] = await Promise.all([
    getFlexiblePageEntries(),
    getBlogPostEntries(),
  ]);

  // Flexible-page slugs are full paths ("/", "/careers"); blog slugs are bare.
  const pageLinks: SitemapLink[] = pages
    .map((p) => {
      const href = p.slug.startsWith("/") ? p.slug : `/${p.slug}`;
      return { href, label: href === "/" ? "Home" : p.title?.trim() || humanize(href) };
    })
    // Home first, then alphabetical so the list stays predictable.
    .sort((a, b) =>
      a.href === "/" ? -1 : b.href === "/" ? 1 : a.label.localeCompare(b.label)
    );

  const postLinks: SitemapLink[] = posts
    .map((post) => {
      const slug = post.slug.replace(/^\/+/, "");
      return { href: `/blog/${slug}`, label: post.title?.trim() || humanize(slug) };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const sections: { heading: string; links: SitemapLink[] }[] = [
    { heading: "Pages", links: pageLinks },
    { heading: "Blog", links: postLinks },
  ].filter((s) => s.links.length > 0);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      lang={locale.htmlLang}
      className="mx-auto w-full max-w-[1240px] px-6 py-16 md:py-24 lg:px-10 border-t border-white/20"
    >
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Sitemap</h1>
      <p className="mt-4 max-w-[640px] text-sm leading-relaxed text-gray-400">
        A complete index of every page on the Dynamic Fitness website. Looking for
        the machine-readable version?{" "}
        <a href="/sitemap.xml" className="underline transition-colors hover:text-white">
          View the XML sitemap
        </a>
        .
      </p>

      <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
              {section.heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={localizeHref(link.href, locale)}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
