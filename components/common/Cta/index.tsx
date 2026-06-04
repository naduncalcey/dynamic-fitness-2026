"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type MouseEvent } from "react";
import type { CtaEntry, CtaSize, CtaVariant } from "@/lib/contentful/common/types";
import {
  isExternalHref,
  resolveCtaHref,
} from "@/lib/contentful/common/resolveCtaHref";
import { getLocaleFromPathname, localizeHref } from "@/lib/i18n/locale";

/**
 * CTA button, ported from the previous Dynamic Fitness site's SpotlightButton.
 *
 * Two variants — `Red` (primary) and `Gray` (secondary) — both render the dark
 * glassmorphism pill with a mouse-tracking spotlight beam on hover. Variant and
 * size are routed with switch-case so adding a new option in Contentful means
 * adding one branch here (see components/ARCHITECTURE.md theming rules; colors
 * come from CSS variables in app/globals.css, never hard-coded hex).
 */

type CtaProps = {
  cta: CtaEntry;
  className?: string;
};

const sizeClasses = (size: CtaSize): string => {
  switch (size) {
    case "Small":
      return "px-5 py-2 text-xs";
    case "Large":
      return "px-10 py-4 text-base";
    case "Medium":
    default:
      return "px-8 py-[0.9rem] text-sm";
  }
};

// Gradients are inlined (not routed through a :root variable) so the nested
// var(--spot-x/--spot-y) resolves against this element and tracks the mouse —
// matching the previous site's SpotlightButton exactly.
const variantStyle = (variant: CtaVariant): { borderColor: string; beam: string } => {
  switch (variant) {
    case "Gray":
      return {
        borderColor: "var(--cta-gray-border)",
        beam: "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 20%, rgba(0,0,0,0) 55%)",
      };
    case "Red":
    default:
      return {
        borderColor: "var(--cta-red-border)",
        beam: "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,120,120,0.25) 0%, rgba(255,80,80,0.1) 20%, rgba(0,0,0,0) 55%)",
      };
  }
};

export function Cta({ cta, className = "" }: CtaProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const current = getLocaleFromPathname(usePathname() ?? "/");

  if (!cta?.label) return null;

  const href = resolveCtaHref(cta);
  const variant = (cta.variant as CtaVariant) || "Red";
  const size = (cta.size as CtaSize) || "Medium";
  const { borderColor, beam } = variantStyle(variant);

  const external = isExternalHref(href) || cta.linkBehavior === "Download";
  const openNewTab = cta.newTab ?? external;

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const classes = [
    "group/cta relative inline-flex items-center justify-center gap-2 w-fit overflow-hidden",
    "rounded-[18px] border bg-[var(--cta-surface)] backdrop-blur-md uppercase tracking-[0.12em]",
    "text-[var(--cta-text)] transition-colors duration-300 hover:text-[var(--cta-text-hover)] cursor-pointer",
    sizeClasses(size),
    cta.fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[350ms] ease-out group-hover/cta:opacity-100"
        style={{ background: beam }}
      />
      <span className="pointer-events-none relative">{cta.label}</span>
      {cta.showArrow ? (
        <span
          aria-hidden
          className="pointer-events-none relative transition-transform duration-300 group-hover/cta:translate-x-1"
        >
          →
        </span>
      ) : null}
    </>
  );

  // Internal app routes use next/link for client-side navigation; external and
  // downloadable links use a plain anchor.
  if (!external && href.startsWith("/")) {
    return (
      <Link
        ref={ref}
        href={localizeHref(href, current)}
        className={classes}
        style={{ borderColor }}
        onMouseMove={handleMouseMove}
      >
        {inner}
      </Link>
    );
  }

  return (
    <a
      ref={ref}
      href={href}
      className={classes}
      style={{ borderColor }}
      onMouseMove={handleMouseMove}
      target={openNewTab ? "_blank" : undefined}
      rel={openNewTab ? "noopener noreferrer" : undefined}
      download={cta.linkBehavior === "Download" ? "" : undefined}
    >
      {inner}
    </a>
  );
}

export default Cta;
