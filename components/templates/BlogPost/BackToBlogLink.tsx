"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { getLocaleFromPathname, localizeHref } from "@/lib/i18n/locale";

/**
 * "Back to blog" link. A small client island so the (server) BlogPost template
 * can stay server-rendered while this one label still localizes via useLabels.
 */
export function BackToBlogLink() {
  const t = useLabels();
  const current = getLocaleFromPathname(usePathname() ?? "/");
  return (
    <Link
      href={localizeHref("/blog", current)}
      className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-white/50 transition-colors hover:text-white"
    >
      <span aria-hidden>←</span> {t("blog.backToBlog")}
    </Link>
  );
}
