import { Cta } from "@/components/common/Cta";
import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { RichText } from "@/components/common/RichText";
import type { HeroSection } from "@/lib/sections/types";
import { UnicornBackground } from "../UnicornBackground";
import { LogoScroll } from "../LogoScroll";

/**
 * Hero - default. Recreates the live dynamicfitness.lk hero: a white headline
 * with a red-gradient serif-italic highlight line over a UnicornStudio WebGL
 * background, a CTA, and a partner-logo marquee below — all framed by the thin
 * white border treatment.
 *
 * The WebGL background is the default; an optional Contentful backgroundImage or
 * backgroundVideo overrides it when set.
 */

type HeroDefaultProps = {
  section: HeroSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

export function HeroDefault({ section }: HeroDefaultProps) {
  const {
    eyebrow,
    headline,
    highlightText,
    subheading,
    backgroundImage,
    backgroundVideo,
    ctas,
  } = section;

  const hasBgImage = Boolean(backgroundImage?.desktop?.url);
  const hasBgVideo = !hasBgImage && Boolean(backgroundVideo);

  return (
    <section className="w-full bg-black lg:border-y lg:border-white/20">
      <div className="relative z-10">
        <div
          className={`relative overflow-hidden py-[100px] md:py-[180px] lg:border-x lg:border-white/20 ${CONTAINER}`}
        >
          {/* Background — WebGL by default; image/video override when set. */}
          {hasBgImage ? (
            <div className="absolute inset-0 -z-10">
              <ResponsiveImage
                image={backgroundImage!}
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
                priority
              />
            </div>
          ) : hasBgVideo ? (
            <div className="absolute inset-0 -z-10 [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&>div]:h-full">
              <VideoPlayer video={backgroundVideo!} className="h-full w-full" />
            </div>
          ) : (
            <UnicornBackground />
          )}

          {/* Dark overlay for text contrast. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-black/40" />

          {eyebrow ? (
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-red-400">{eyebrow}</p>
          ) : null}

          <h1 className="pt-[20px] pb-[20px] text-[38px] font-normal leading-[42px] tracking-[-0.8px] text-white md:pt-[40px] md:text-[72px] md:leading-[72px] md:tracking-[-1.8px]">
            {headline}
            {highlightText ? (
              <>
                {" "}
                <br />
                <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text font-serif font-normal italic text-transparent">
                  {highlightText}
                </span>
              </>
            ) : null}
          </h1>

          {subheading ? (
            <RichText
              content={subheading}
              className="max-w-2xl pt-2 text-lg [&_p]:text-white/70"
            />
          ) : null}

          {ctas.length > 0 ? (
            <div className="flex flex-wrap gap-4 pt-[40px]">
              {ctas.map((cta) => (
                <Cta key={cta.sys.id} cta={cta} />
              ))}
            </div>
          ) : null}
        </div>

        {/* Partner-logo marquee. */}
        <div
          className={`py-5 md:py-6 lg:!px-0 lg:border-x lg:border-t lg:border-white/20 ${CONTAINER}`}
        >
          <LogoScroll />
        </div>
      </div>
    </section>
  );
}

export default HeroDefault;
