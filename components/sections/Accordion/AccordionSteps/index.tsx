"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cta } from "@/components/common/Cta";
import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { RichText } from "@/components/common/RichText";
import type { AccordionItemEntry } from "@/lib/contentful/common/types";
import type { AccordionSection } from "@/lib/sections/types";

/**
 * Accordion - Steps. A scroll-pinned "how it works" section: the panel sticks to
 * the viewport (desktop) and the active step advances one-by-one as you scroll
 * through the section. The active step's number is highlighted in red. On
 * smaller screens it degrades to a normal stacked list (pinning a full-screen
 * panel doesn't work well on mobile).
 *
 * Reuses the Accordion model — item.question = title, item.answer = description,
 * plus a per-item image OR video and an optional cta.
 */

type AccordionStepsProps = {
  section: AccordionSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";
const VH_PER_STEP = 90; // scroll height (vh) allotted per step while pinned

function StepMedia({ item }: { item: AccordionItemEntry }) {
  if (item.video) {
    return (
      <VideoPlayer
        video={item.video}
        className="overflow-hidden rounded-2xl [&_video]:h-[240px] [&_video]:w-full [&_video]:object-cover [&_video]:object-top [&_video]:md:h-[320px]"
      />
    );
  }
  if (item.image) {
    return (
      <ResponsiveImage
        image={item.image}
        className="overflow-hidden rounded-2xl"
        imgClassName="h-[240px] w-full object-cover object-top md:h-[320px]"
        sizes="(max-width: 1024px) 100vw, 720px"
      />
    );
  }
  return null;
}

export function AccordionSteps({ section }: AccordionStepsProps) {
  const { sectionNumber, sectionLabel, headline, description, cta, items } = section;
  const sentences = (headline ?? "").split(/(?<=\.)\s+/).filter(Boolean);

  const [active, setActive] = useState(0);
  const outerRef = useRef<HTMLDivElement>(null);

  // Scroll-drive the active step while the panel is pinned (desktop only).
  useEffect(() => {
    const onScroll = () => {
      const el = outerRef.current;
      if (!el || window.innerWidth < 1024) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      const progress = scrolled / total;
      const idx = Math.min(items.length - 1, Math.max(0, Math.floor(progress * items.length)));
      setActive(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  // Clicking a step scrolls to its segment (so the pin lands on it).
  const goTo = (idx: number) => {
    const el = outerRef.current;
    if (!el || window.innerWidth < 1024) {
      setActive(idx);
      return;
    }
    const total = el.offsetHeight - window.innerHeight;
    const absTop = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: absTop + (idx / items.length) * total + 8, behavior: "smooth" });
  };

  if (items.length === 0) return null;
  const current = items[active] ?? items[0];
  const currentCta = current.cta ?? cta;

  const headerNode: ReactNode = (
    <div className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-white/70">
          {sectionNumber}
        </span>
        <div className="h-4 w-px bg-white/20" />
        <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-red-600">
          {sectionLabel}
        </span>
      </div>
      <h2 className="mt-6 text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
        {sentences.map((s, i) => (
          <span key={i}>
            {i === sentences.length - 1 && sentences.length > 1 ? (
              <span className="text-white/50">{s}</span>
            ) : (
              s
            )}
            {i < sentences.length - 1 ? <br /> : null}
          </span>
        ))}
      </h2>
      {description ? (
        <RichText
          content={description}
          className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base [&_p:last-child]:mb-0"
        />
      ) : null}
    </div>
  );

  return (
    <section className="w-full border-t border-white/20 bg-black">
      {/* Header */}
      <div className={`pt-[80px] md:pt-[120px] lg:pt-[140px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
        {headerNode}
      </div>

      {/* Desktop: pinned, scroll-driven panel */}
      <div
        ref={outerRef}
        className={`relative hidden lg:block lg:border-x lg:border-white/20 ${CONTAINER}`}
        style={{ height: `${items.length * VH_PER_STEP}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center">
          <div className="grid w-full grid-cols-[1fr_1.3fr] gap-12 py-12">
            {/* Step selector */}
            <div className="flex flex-col gap-2">
              {items.map((item, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={item.sys.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-pressed={isActive}
                    className={`flex w-full items-baseline justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors duration-300 ${
                      isActive ? "bg-white/[0.05] text-white" : "cursor-pointer text-white/40 hover:text-white/70"
                    }`}
                  >
                    <span className="text-2xl font-normal tracking-tight md:text-3xl">
                      {item.question}
                    </span>
                    <span
                      className={`shrink-0 font-mono text-xs transition-colors ${
                        isActive ? "text-red-500" : "text-white/30"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active step panel — re-keyed so it fades up on change */}
            <div key={current.sys.id} className="animate-fade-up flex flex-col">
              <StepMedia item={current} />
              <div className="mt-6">
                <h3 className="text-xl font-medium text-white md:text-2xl">{current.question}</h3>
                {current.answer ? (
                  <RichText
                    content={current.answer}
                    className="mt-3 text-sm leading-relaxed text-gray-400 md:text-base [&_p:last-child]:mb-0"
                  />
                ) : null}
                {currentCta ? (
                  <div className="mt-6">
                    <Cta cta={currentCta} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked steps (no pinning) */}
      <div className={`pb-[60px] pt-12 md:pb-[80px] lg:hidden ${CONTAINER}`}>
        <div className="flex flex-col gap-10">
          {items.map((item, i) => (
            <div key={item.sys.id} className="flex flex-col gap-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-red-500">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-xl font-medium text-white">{item.question}</h3>
              </div>
              <StepMedia item={item} />
              {item.answer ? (
                <RichText
                  content={item.answer}
                  className="text-sm leading-relaxed text-gray-400 [&_p:last-child]:mb-0"
                />
              ) : null}
            </div>
          ))}
          {cta ? (
            <div className="pt-2">
              <Cta cta={cta} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default AccordionSteps;
