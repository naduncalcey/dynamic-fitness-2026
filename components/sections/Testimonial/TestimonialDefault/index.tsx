"use client";

import { useEffect, useState } from "react";
import type { ReviewEntry } from "@/lib/contentful/common/types";
import type { TestimonialSection } from "@/lib/sections/types";

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
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-red-500" : "text-white/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialDefault({ section }: TestimonialDefaultProps) {
  const reviews = section.reviews;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const current: ReviewEntry = reviews[index] ?? reviews[0];

  return (
    <section className="w-full border-t border-white/20 bg-black">
      <div className={`py-[60px] md:py-[80px] lg:py-[120px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
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
            {current.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.avatarUrl}
                alt={current.authorName ?? ""}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="text-left">
              <p className="text-sm font-medium text-white">{current.authorName}</p>
              <p className="text-xs text-white/40">{current.timeAgo}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialDefault;
