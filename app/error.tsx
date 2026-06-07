"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, localizeHref, DEFAULT_LOCALE } from "@/lib/i18n/locale";

/**
 * Branded route error boundary. Catches runtime errors thrown while rendering a
 * page (e.g. a failed render in the catch-all route) and shows a friendly,
 * on-brand message with a retry instead of Next's default error screen.
 * Rendered inside the root layout, so Header/Footer still wrap it.
 */

type Copy = { eyebrow: string; title: string; body: string; retry: string; home: string };

const COPY: Record<string, Copy> = {
  en: {
    eyebrow: "Error",
    title: "Something went wrong",
    body: "An unexpected error occurred on our end. Please try again.",
    retry: "Try again",
    home: "Back to home",
  },
  si: {
    eyebrow: "දෝෂය",
    title: "යම් දෝෂයක් ඇති විය",
    body: "අනපේක්ෂිත දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    retry: "නැවත උත්සාහ කරන්න",
    home: "මුල් පිටුවට",
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = getLocaleFromPathname(usePathname() ?? "/");
  const t = COPY[locale.urlSlug] ?? COPY[DEFAULT_LOCALE.urlSlug];

  useEffect(() => {
    // Surface the error (and its digest) to the console / monitoring.
    console.error(error);
  }, [error]);

  return (
    <main
      lang={locale.htmlLang}
      className="flex min-h-[70vh] w-full items-center justify-center border-t border-white/20 bg-black px-6 py-24"
    >
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-500">{t.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-normal tracking-tight text-white sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">{t.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer rounded-full bg-red-500 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-600"
          >
            {t.retry}
          </button>
          <Link
            href={localizeHref("/", locale)}
            className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-white"
          >
            {t.home}
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
