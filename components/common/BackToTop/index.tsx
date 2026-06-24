"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { useFloatingButtons } from "@/components/common/FloatingButtonsProvider";

/**
 * Floating circular "back to top" button with a scroll-progress ring. Fixed
 * bottom-right; fades in once the page is scrolled past a threshold. The ring
 * fills clockwise from the top as the page scrolls, and clicking smooth-scrolls
 * to the top.
 *
 * Styled to match the site's dark glassmorphism CTA — var(--cta-surface) with a
 * thin border and backdrop blur — and the brand red-gradient progress arc (the
 * same red used by the serif highlight motif).
 *
 * Rendered by the catch-all route only when a FlexiblePage's `showBackToTop`
 * toggle is enabled in Contentful.
 */

const SIZE = 56;
const STROKE = 2.5;
const RADIUS = SIZE / 2 - STROKE;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SHOW_AFTER = 400; // px scrolled before the button appears

export function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const t = useLabels();
  const { setBackToTopVisible } = useFloatingButtons();

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(top / max, 1) : 0);
      setVisible(top > SHOW_AFTER);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Tell the floating-button dock whether we're showing, so the music button
  // can sit above us (when visible) or drop to the bottom (when hidden). Reset
  // to false on unmount so pages without a BackToTop don't leave it stuck.
  useEffect(() => {
    setBackToTopVisible(visible);
  }, [visible, setBackToTopVisible]);

  useEffect(() => () => setBackToTopVisible(false), [setBackToTopVisible]);

  return (
    <button
      type="button"
      aria-label={t("a11y.backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`group fixed bottom-6 right-6 z-30 grid size-14 place-items-center rounded-full border border-white/15 bg-[var(--cta-surface)] text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[var(--cta-red-border)] hover:text-white ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full -rotate-90"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
      >
        <defs>
          <linearGradient id="backToTopProgress" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--brand-primary-hover)" }} />
            <stop offset="100%" style={{ stopColor: "var(--brand-primary)" }} />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="url(#backToTopProgress)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.5} />
    </button>
  );
}

export default BackToTop;
