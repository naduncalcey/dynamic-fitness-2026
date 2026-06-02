import Image from "next/image";
import { Cta } from "@/components/common/Cta";
import { RichText } from "@/components/common/RichText";
import type { BannerSection } from "@/lib/sections/types";

/**
 * Banner - CTA. Recreates the old site's closing call-to-action: a background
 * image with a heavy dark overlay, a centered headline with a red-gradient
 * serif-italic highlight word ending in "?", a description, and a red CTA.
 */

type BannerCtaProps = {
  section: BannerSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

export function BannerCta({ section }: BannerCtaProps) {
  const { headline, highlightWord, description, cta, backgroundImage } = section;
  const bgUrl = backgroundImage?.desktop?.url ?? null;

  return (
    <section className="w-full border-t border-white/20 bg-black">
      <div
        className={`relative z-0 overflow-hidden py-[80px] md:py-[120px] lg:py-[160px] lg:border-x lg:border-white/20 ${CONTAINER}`}
      >
        {bgUrl ? (
          <Image
            src={bgUrl}
            alt={backgroundImage?.altText ?? ""}
            fill
            sizes="(max-width: 1240px) 100vw, 1240px"
            className="z-0 object-cover object-center"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/75" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {headline}
            {highlightWord ? (
              <>
                {" "}
                <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text font-serif italic text-transparent">
                  {highlightWord}
                </span>
              </>
            ) : null}
            ?
          </h2>

          {description ? (
            <RichText
              content={description}
              className="mt-6 max-w-lg text-base leading-relaxed text-gray-400 md:text-lg [&_a]:text-red-400 [&_a]:underline [&_p]:text-gray-400 [&_p:last-child]:mb-0"
            />
          ) : null}

          {cta ? (
            <div className="mt-10">
              <Cta cta={cta} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default BannerCta;
