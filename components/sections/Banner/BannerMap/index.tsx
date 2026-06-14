"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import type { BannerSection } from "@/lib/sections/types";

/**
 * Banner / Map. A display-only Google Map of the gym's location, framed in the
 * site's thin white border on black, with an optional headline above. The
 * embedded map is non-interactive (pointer + keyboard interaction disabled);
 * clicking anywhere on the frame opens the full Google Maps view in a new tab.
 * A skeleton shimmer shows behind the iframe until it loads, then it fades in.
 * The embed URL is editable in Contentful (Banner.mapEmbedUrl).
 */

type BannerMapProps = {
  section: BannerSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

/**
 * Turn a Google Maps *embed* URL (…/maps/embed?pb=…!2d<lng>!3d<lat>…) into a
 * shareable link that opens the full Google Maps UI. Falls back to the embed
 * URL itself when the center coordinates can't be parsed.
 */
function toMapsLink(embedUrl: string): string {
  const lng = embedUrl.match(/!2d(-?\d+\.\d+)/)?.[1];
  const lat = embedUrl.match(/!3d(-?\d+\.\d+)/)?.[1];
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return embedUrl;
}

export function BannerMap({ section }: BannerMapProps) {
  const { headline, highlightWord, mapEmbedUrl } = section;
  const [loaded, setLoaded] = useState(false);
  const t = useLabels();

  if (!mapEmbedUrl) return null;

  const mapsLink = toMapsLink(mapEmbedUrl);

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

        <div className="group relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] md:h-[460px]">
          <span
            aria-hidden
            className={`ds-skeleton pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />
          {/* Display only: interaction is disabled and the iframe is hidden from
              the a11y tree — the overlay anchor below carries the accessible name. */}
          <iframe
            src={mapEmbedUrl}
            title={t("map.iframeTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={-1}
            aria-hidden
            onLoad={() => setLoaded(true)}
            className={`pointer-events-none relative h-full w-full border-0 transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* The whole frame links out to the full Google Maps view in a new tab. */}
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("map.openAria")}
            className="absolute inset-0 z-10 flex items-end justify-end rounded-2xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              {t("map.openLabel")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default BannerMap;
