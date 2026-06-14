"use client";

import { Sparkle } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";

/**
 * "AI Enhanced" image badge. A small client island so the label localizes
 * inside the otherwise server-rendered InfoImageExplainer section.
 */
export function AiBadge() {
  const t = useLabels();
  return (
    <span className="pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
      <Sparkle className="h-3 w-3 text-red-400" fill="currentColor" strokeWidth={1.5} aria-hidden />
      {t("about.aiEnhancedBadge")}
    </span>
  );
}

export default AiBadge;
