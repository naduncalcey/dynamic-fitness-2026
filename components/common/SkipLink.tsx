"use client";

import { useLabels } from "@/lib/i18n/LabelsProvider";

/**
 * Keyboard skip link — the first focusable element on the page; jumps past the
 * header to the page's <main id="main-content">. Visually hidden until focused.
 * A client component so the label localizes via the URL locale (useLabels), so
 * it must render inside LabelsProvider.
 */
export function SkipLink() {
  const t = useLabels();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-red-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}

export default SkipLink;
