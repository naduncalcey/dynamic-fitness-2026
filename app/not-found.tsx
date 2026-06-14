"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, localizeHref, DEFAULT_LOCALE } from "@/lib/i18n/locale";

/**
 * Branded 404. A client component so it localizes its copy from the URL locale
 * (via usePathname) using a small inline COPY table — mirroring app/error.tsx.
 * Rendered inside the root layout, so the Header/Footer wrap it.
 */

type Copy = { eyebrow: string; title: string; body: string; home: string; blog: string };

const COPY: Record<string, Copy> = {
  en: {
    eyebrow: "Error 404",
    title: "Page not found",
    body: "The page you’re looking for doesn’t exist or may have moved.",
    home: "Back to home",
    blog: "Read the blog",
  },
  si: {
    eyebrow: "දෝෂය 404",
    title: "පිටුව හමු නොවීය",
    body: "ඔබ සොයන පිටුව නොපවතී, නැතහොත් එය වෙනත් තැනකට ගොස් තිබිය හැකිය.",
    home: "මුල් පිටුවට",
    blog: "බ්ලොගය කියවන්න",
  },
};

export default function NotFound() {
  const locale = getLocaleFromPathname(usePathname() ?? "/");
  const t = COPY[locale.urlSlug] ?? COPY[DEFAULT_LOCALE.urlSlug];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      lang={locale.htmlLang}
      className="flex min-h-[70vh] w-full items-center justify-center border-t border-white/20 bg-black px-6 py-24"
    >
      <div className="mx-auto max-w-md text-center">
        <p
          className="select-none text-[120px] font-bold leading-none tracking-tighter sm:text-[160px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,90,90,0.35) 0%, rgba(255,255,255,0.04) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          aria-hidden
        >
          404
        </p>
        <p className="-mt-4 text-xs font-medium uppercase tracking-[0.25em] text-red-500">
          {t.eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-normal tracking-tight text-white sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">{t.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localizeHref("/", locale)}
            className="rounded-full bg-red-500 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-600"
          >
            {t.home}
          </Link>
          <Link
            href={localizeHref("/blog", locale)}
            className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-white"
          >
            {t.blog}
          </Link>
        </div>
      </div>
    </main>
  );
}
