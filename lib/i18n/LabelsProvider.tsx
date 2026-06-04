"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, getLocaleFromPathname } from "./locale";
import type { AllLabels } from "@/lib/contentful/uiLabels";

/**
 * Client-side UI-label access. The root layout fetches every locale's labels
 * (Contentful `uiLabel` entries) and feeds them in here once. Components call
 * `useLabels()` to get a translate function bound to the current locale — which
 * is derived from the URL via usePathname(), so it follows the language switch
 * without the layout needing to know the active locale.
 */

const LabelsContext = createContext<AllLabels>({});

export function LabelsProvider({
  labels,
  children,
}: {
  labels: AllLabels;
  children: ReactNode;
}) {
  return <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>;
}

/** `t("nav.about")`; supports `{token}` interpolation: `t("blog.noMatch", { q })`. */
export type Translate = (key: string, vars?: Record<string, string | number>) => string;

export function useLabels(): Translate {
  const all = useContext(LabelsContext);
  const pathname = usePathname() ?? "/";
  const slug = getLocaleFromPathname(pathname).urlSlug;

  return useMemo(() => {
    const active = all[slug] ?? {};
    const fallback = all[DEFAULT_LOCALE.urlSlug] ?? {};
    return (key, vars) => {
      // Active locale → default locale → the key itself (so a missing label is
      // visible in dev rather than rendering blank).
      let str = active[key] ?? fallback[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v));
        }
      }
      return str;
    };
  }, [all, slug]);
}
