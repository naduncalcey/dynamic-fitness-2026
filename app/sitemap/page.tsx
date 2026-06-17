import type { Metadata } from "next";
import { SitemapView } from "@/components/common/SitemapView";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { absoluteUrl } from "@/lib/seo";

/**
 * Human-readable HTML sitemap at /sitemap — a browsable index of every page,
 * the companion to the machine-readable /sitemap.xml (app/sitemap.ts). Both
 * read the same Contentful helpers, so the two never drift apart.
 *
 * This fixed `/sitemap` segment resolves ahead of the catch-all [[...slug]]
 * route for the default locale. Non-default locales (e.g. /si/sitemap) are
 * handled by the catch-all, which renders the same <SitemapView>. Linked from
 * the footer's Company column.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "A complete, human-readable index of every page on the Dynamic Fitness website.",
  alternates: { canonical: absoluteUrl("/sitemap") },
};

export default function SitemapPage() {
  return <SitemapView locale={DEFAULT_LOCALE} />;
}
