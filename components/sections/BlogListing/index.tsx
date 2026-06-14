"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RichText } from "@/components/common/RichText";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { UnicornBackground } from "@/components/sections/Hero/UnicornBackground";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { Search } from "lucide-react";
import type { BlogListingSection } from "@/lib/sections/types";

/**
 * Blog listing section. A WebGL banner (UnicornStudio) carries the heading,
 * intro, and a live search box; below it a responsive grid of post cards
 * (fetched during hydration, newest first) filtered client-side by the query.
 * Used on the /blog page.
 *
 * The page is statically prerendered (ISR). To keep the full post grid in the
 * static HTML (good for SEO/LCP) without rendering the section twice, the query
 * is seeded from `?q=` on the client after mount (via `window.location`) rather
 * than with `useSearchParams()` — the latter would force a `<Suspense>` boundary
 * whose fallback duplicated the whole section in the streamed HTML.
 */

type BlogListingProps = {
  section: BlogListingSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

// Blog-specific UnicornStudio scene (distinct from the home hero).
const BLOG_UNICORN_PROJECT_ID = "gYGCraBekUyqZWu3BIB5";
const BLOG_UNICORN_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.4/dist/unicornStudio.umd.js";

/** Presentational view — no `useSearchParams`, so it's safe to prerender. */
function BlogListingView({
  section,
  query,
  onQueryChange,
}: {
  section: BlogListingSection;
  query: string;
  onQueryChange: (next: string) => void;
}) {
  const { heading, description, posts } = section;
  const t = useLabels();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        post.author?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  return (
    <section className="w-full border-t border-white/20 bg-black">
      {/* WebGL banner with search. The `relative z-10` wrapper establishes a
          stacking context so the -z-10 scene paints above the section bg. */}
      <div className="relative z-10 border-b border-white/10">
        <div
          className={`relative overflow-hidden py-[80px] md:py-[110px] lg:py-[130px] lg:border-x lg:border-white/20 ${CONTAINER}`}
        >
          <UnicornBackground
            projectId={BLOG_UNICORN_PROJECT_ID}
            scriptSrc={BLOG_UNICORN_SCRIPT_SRC}
            filter={null}
          />
          {/* Legibility overlay over the WebGL scene */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
          />
          <div className="mx-auto max-w-3xl text-center">
            {heading ? (
              <h1 className="text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {heading}
              </h1>
            ) : null}
            {description ? (
              <RichText
                content={description}
                className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base [&_p:last-child]:mb-0"
              />
            ) : null}

            {/* Search */}
            <div className="relative mx-auto mt-8 max-w-md">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={t("blog.searchPlaceholder")}
                aria-label={t("blog.searchAria")}
                className="w-full rounded-full border border-white/15 bg-black/40 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-colors focus:border-red-500/60 focus:bg-black/60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={`py-[60px] md:py-[80px] lg:py-[100px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filtered.map((post) => (
              <BlogPostCard key={post.sys.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-white/70">
            {posts.length === 0
              ? t("blog.noPosts")
              : t("blog.noMatch", { q: query.trim() })}
          </p>
        )}
      </div>
    </section>
  );
}

/** Interactive wrapper — seeds the query from `?q=` and mirrors it back to the URL. */
function BlogListingInteractive({ section }: BlogListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  // Seed the query from `?q=` after mount. Reading window.location here (instead
  // of useSearchParams) avoids the Suspense boundary that duplicated the section
  // in the static HTML. SSR/first paint shows all posts; a `?q=` deep link
  // applies its filter once hydrated.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  // Mirror the query into the URL (?q=) so results are shareable/bookmarkable,
  // without scrolling or pushing a new history entry per keystroke.
  const onQueryChange = useCallback(
    (next: string) => {
      setQuery(next);
      const params = new URLSearchParams(window.location.search);
      if (next.trim()) params.set("q", next);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  return <BlogListingView section={section} query={query} onQueryChange={onQueryChange} />;
}

export function BlogListing({ section }: BlogListingProps) {
  return <BlogListingInteractive section={section} />;
}

export default BlogListing;
