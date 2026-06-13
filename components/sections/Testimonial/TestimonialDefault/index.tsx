"use client";

import { useEffect, useState } from "react";
import type { ReviewEntry } from "@/lib/contentful/common/types";
import type { TestimonialSection } from "@/lib/sections/types";
import { SkeletonImage } from "@/components/common/SkeletonImage";
import { Star } from "lucide-react";

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
              <p className="text-xs text-white/40">{current.timeAgo}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialDefault;
