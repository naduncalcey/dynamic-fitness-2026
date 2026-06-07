"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/lib/i18n/locale";

/**
 * Keeps `<html lang>` in sync with the URL locale (e.g. `/si/...` → `si-LK`).
 *
 * The root layout is shared across every statically-generated path and can't
 * read the request URL without a dynamic API (which would disable ISR), so the
 * document is rendered with the default locale's lang and corrected here on the
 * client. Reacting to `usePathname` also covers client-side locale switches.
 * `lang` is non-visual, so updating it just after hydration is fine — assistive
 * tech and audits read the live DOM, and each page's `<main lang>` already gives
 * the content itself the right language in the server-rendered HTML.
 */
export function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = getLocaleFromPathname(pathname ?? "/").htmlLang;
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [pathname]);

  return null;
}

export default HtmlLangSync;
