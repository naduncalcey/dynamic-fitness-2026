"use client";

import { useState } from "react";
import type { BannerSection } from "@/lib/sections/types";

/**
 * Banner / Map. An embedded Google Map (the gym's location) framed in the site's
 * thin white border on black, with an optional headline above. A skeleton
 * shimmer shows behind the iframe until it loads, then the map fades in. The
 * embed URL is editable in Contentful (Banner.mapEmbedUrl).
 */

type BannerMapProps = {
  section: BannerSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

export function BannerMap({ section }: BannerMapProps) {
  const { headline, highlightWord, mapEmbedUrl } = section;
  const [loaded, setLoaded] = useState(false);

  if (!mapEmbedUrl) return null;

  return (
    <section id="location" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
      <div className={`py-[60px] md:py-[80px] lg:border-x lg:border-white/20 lg:py-[100px] ${CONTAINER}`}>
        {headline ? (
          <h2 className="mb-8 max-w-2xl text-[28px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            {headline}
            {highlightWord ? (
              <>
                {" "}
                <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text font-serif italic text-transparent">
                  {highlightWord}
                </span>
              </>
            ) : null}
          </h2>
        ) : null}

        <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] md:h-[460px]">
          <span
            aria-hidden
            className={`ds-skeleton pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <iframe
            src={mapEmbedUrl}
            title="Dynamic Fitness location on Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            className={`relative h-full w-full border-0 transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </section>
  );
}

export default BannerMap;
