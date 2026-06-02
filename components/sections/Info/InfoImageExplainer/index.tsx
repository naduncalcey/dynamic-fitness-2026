import Image from "next/image";
import { Cta } from "@/components/common/Cta";
import { RichText } from "@/components/common/RichText";
import type { ImageEntry } from "@/lib/contentful/common/types";
import type { InfoSection } from "@/lib/sections/types";
import { CursorTooltip } from "../CursorTooltip";

/**
 * Info - Image Explainer. Recreates the old site's About section: a two-column
 * header (section number/label + split headline | description + CTA), a large
 * facility image, and a three-image gallery. Every image has a red blend
 * overlay, a hover zoom, and a cursor-following tooltip.
 */

type InfoImageExplainerProps = {
  section: InfoSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

// Red mix-blend tint laid over each image (matches the old About).
const overlayStyle = {
  backgroundColor: "rgba(255, 0, 0, 0.1)",
  mixBlendMode: "color" as const,
};

function BlendImage({
  image,
  imgClassName,
  sizes,
}: {
  image: ImageEntry | null | undefined;
  imgClassName: string;
  sizes: string;
}) {
  const asset = image?.desktop;
  if (!asset?.url) return null;
  return (
    <>
      <Image
        src={asset.url}
        alt={image?.altText ?? image?.title ?? ""}
        width={asset.width ?? 1240}
        height={asset.height ?? 600}
        sizes={sizes}
        className={imgClassName}
      />
      <div className="pointer-events-none absolute inset-0 z-10" style={overlayStyle} />
    </>
  );
}

export function InfoImageExplainer({ section }: InfoImageExplainerProps) {
  const {
    sectionNumber,
    sectionLabel,
    headline,
    headlineFaded,
    description,
    imageTooltips,
    cta,
    mainImage,
    galleryImages,
  } = section;

  return (
    <section id="about" className="w-full scroll-mt-20 bg-black">
      <div
        className={`py-[60px] md:py-[80px] lg:py-[100px] lg:border-x lg:border-white/20 ${CONTAINER}`}
      >
        {/* Header row */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-[20px]">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.25em] text-white/70">
              {sectionNumber}
              <span className="ml-2 border-l border-white/20 pl-4 text-[12px] font-medium uppercase tracking-[0.25em] text-red-600">
                {sectionLabel}
              </span>
            </p>
            <h2 className="mt-6 text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:mt-10 md:text-5xl lg:text-6xl">
              {headline}
              <br />
              <span className="text-white/50">{headlineFaded}</span>
            </h2>
          </div>
          <div className="md:py-12">
            {description ? (
              <RichText
                content={description}
                className="max-w-md text-base leading-relaxed text-gray-400 md:text-lg [&_a]:text-red-400 [&_a]:underline [&_p]:text-gray-400 [&_p:last-child]:mb-0"
              />
            ) : null}
            {cta ? <Cta cta={cta} className="mt-6" /> : null}
          </div>
        </div>

        {/* Main image */}
        {mainImage ? (
          <CursorTooltip label={imageTooltips[0] ?? ""}>
            <div className="group relative mt-4 cursor-none overflow-hidden rounded-3xl md:mt-6">
              <BlendImage
                image={mainImage}
                sizes="(max-width: 1240px) 100vw, 1240px"
                imgClassName="h-[280px] w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 sm:h-[380px] md:h-[480px] lg:h-[600px]"
              />
              {/* AI Enhanced badge */}
              <span className="pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
                <svg className="h-3 w-3 text-red-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2l1.9 5.6L19.5 9l-5.6 1.9L12 16l-1.9-5.1L4.5 9l5.6-1.4L12 2z" />
                </svg>
                AI Enhanced
              </span>
            </div>
          </CursorTooltip>
        ) : null}

        {/* Three-image gallery */}
        {galleryImages.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-4 md:gap-4">
            {galleryImages.map((image, i) => (
              <CursorTooltip key={image.sys.id} label={imageTooltips[i + 1] ?? ""}>
                <div className="group relative cursor-none overflow-hidden rounded-2xl">
                  <BlendImage
                    image={image}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    imgClassName="h-[280px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:h-[160px] md:h-[200px] lg:h-[240px]"
                  />
                </div>
              </CursorTooltip>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default InfoImageExplainer;
