"use client";

import { useEffect, useState } from "react";
import type { ReviewEntry } from "@/lib/contentful/common/types";
import type { TestimonialSection } from "@/lib/sections/types";
import { SkeletonImage } from "@/components/common/SkeletonImage";
import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Testimonial - Default. Recreates the old site's single-testimonial carousel:
 * centered star rating, a large quote, and the author avatar/name/time, on a
 * dark backdrop with border framing. Auto-rotates every 8s with a fade-up
 * transition (CSS keyframe `fadeUp`, keyed on the active index).
 */

type TestimonialDefaultProps = {
  section: TestimonialSection;
};

const ROTATE_MS = 8000;
const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mb-6 flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-red-500" : "text-white/15"}`}
          fill="currentColor"
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function TestimonialDefault({ section }: TestimonialDefaultProps) {
  const reviews = section.reviews;
  const [index, setIndex] = useState(0);
  // Pause while the user hovers/focuses the carousel, and don't auto-advance at
  // all for visitors who prefer reduced motion (WCAG 2.2.2 / 2.3.3).
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const t = useLabels();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reviews.length <= 1 || paused || reduceMotion) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [reviews.length, paused, reduceMotion]);

  if (reviews.length === 0) return null;

  const current: ReviewEntry = reviews[index] ?? reviews[0];
  const multiple = reviews.length > 1;

  // Manual navigation, wrapping at both ends.
  const goPrev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const goNext = () => setIndex((i) => (i + 1) % reviews.length);

  return (
    <section
      className="w-full border-t border-white/20 bg-black"
      aria-roledescription="carousel"
      aria-label={t("testimonials.label")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={`relative py-[60px] md:py-[80px] lg:py-[120px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
        {/* Manual prev/next arrows, flanking the quote on the sides. */}
        {multiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("testimonials.previous")}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 lg:left-4"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t("testimonials.next")}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 lg:right-4"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        ) : null}
        <div className="mx-auto flex min-h-[280px] max-w-3xl flex-col items-center justify-center text-center sm:min-h-[260px] md:min-h-[300px] lg:min-h-[320px]">
          <StarRating rating={current.rating ?? 5} />

          {/* keyed on index so the fade-up animation replays on each rotation */}
          <blockquote
            key={`quote-${index}`}
            className="animate-fade-up text-xl font-normal leading-relaxed tracking-tight text-white sm:text-2xl md:text-3xl lg:text-[32px]"
          >
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          <div key={`author-${index}`} className="animate-fade-up mt-10 flex items-center gap-3">
            {/* Custom Image entry takes precedence over the plain avatar URL. */}
            {current.image?.desktop?.url ? (
              <ResponsiveImage
                image={current.image}
                sizes="40px"
                className="h-10 w-10 shrink-0 overflow-hidden rounded-full"
                imgClassName="h-10 w-10 rounded-full object-cover"
              />
            ) : current.avatarUrl ? (
              <SkeletonImage
                kind="plain"
                wrapperClassName="h-10 w-10 shrink-0"
                skeletonClassName="rounded-full"
                src={current.avatarUrl}
                alt={current.authorName ?? ""}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : null}
            <div className="text-left">
              <p className="text-sm font-medium text-white">{current.authorName}</p>
              <p className="text-xs text-white/70">{current.timeAgo}</p>
            </div>
          </div>

          {multiple ? (
            <div
              role="group"
              aria-label={t("testimonials.choose")}
              className="mt-10 flex items-center justify-center gap-2.5"
            >
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t("testimonials.show", { n: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${
                    i === index ? "bg-red-500" : "bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default TestimonialDefault;
