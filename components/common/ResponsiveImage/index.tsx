"use client";

import NextImage, { getImageProps } from "next/image";
import { useState } from "react";
import type { AssetEntry, ImageEntry } from "@/lib/contentful/common/types";

// Tailwind's `md` breakpoint is 768px, so "mobile" is anything below it. The
// art-directed <picture> swaps assets on this boundary, matching the old
// `md:hidden` / `md:block` markup it replaces.
const MOBILE_MEDIA = "(max-width: 767px)";
const DESKTOP_MEDIA = "(min-width: 768px)";

/**
 * Renders an Image entry with next/image optimization. When a `mobile` asset is
 * present it is art-directed in below the `md` breakpoint; otherwise the
 * `desktop` asset is used at all sizes. SVGs bypass next/image (which would
 * rasterize them) and render as a plain <img>.
 *
 * An animated skeleton is shown behind the image until it loads (see the
 * `.ds-skeleton` styles in globals.css): the figure is the relative box, the
 * skeleton pins `absolute inset-0`, and each image is `relative` so it paints
 * over the skeleton, which fades out once any image finishes loading.
 */

type ResponsiveImageProps = {
  image: ImageEntry;
  className?: string;
  imgClassName?: string;
  /** Passed to next/image; defaults to full viewport width. */
  sizes?: string;
  /** Override the entry's `priority` flag (eager + high fetch priority). */
  priority?: boolean;
};

const isSvg = (asset: AssetEntry) =>
  asset.contentType === "image/svg+xml" || (asset.url ?? "").endsWith(".svg");

function Asset({
  asset,
  alt,
  sizes,
  priority,
  className,
  onReady,
}: {
  asset: AssetEntry;
  alt: string;
  sizes: string;
  priority: boolean;
  className: string;
  onReady: () => void;
}) {
  if (!asset.url) return null;

  if (isSvg(asset)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.url}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        onLoad={onReady}
        onError={onReady}
      />
    );
  }

  return (
    <NextImage
      src={asset.url}
      alt={alt}
      width={asset.width ?? 1200}
      height={asset.height ?? 800}
      sizes={sizes}
      priority={priority}
      className={className}
      onLoad={onReady}
      onError={onReady}
    />
  );
}

/**
 * Art-directed raster image: a real <picture> so the browser downloads ONLY
 * the source matching the viewport — phones never fetch the desktop hero, and
 * vice-versa. Both srcsets point at Next's optimizer (`/_next/image`), which
 * content-negotiates AVIF/WebP per request, so each device gets the smallest
 * modern format at the right resolution.
 *
 * When `priority` (the hero), we also emit media-scoped <link rel="preload">
 * tags — React hoists them to <head> — so the LCP image starts downloading
 * from the preload scanner before the <picture> is even parsed. The `media`
 * attribute means only the device-appropriate one ever fires.
 */
function ArtDirected({
  desktop,
  mobile,
  alt,
  sizes,
  priority,
  className,
  onReady,
}: {
  desktop: AssetEntry;
  mobile: AssetEntry;
  alt: string;
  sizes: string;
  priority: boolean;
  className: string;
  onReady: () => void;
}) {
  const shared = { alt, sizes, priority } as const;
  const { props: desktopProps } = getImageProps({
    ...shared,
    src: desktop.url!,
    width: desktop.width ?? 1920,
    height: desktop.height ?? 1080,
  });
  const { props: mobileProps } = getImageProps({
    ...shared,
    src: mobile.url!,
    width: mobile.width ?? 828,
    height: mobile.height ?? 1104,
  });

  return (
    <>
      {priority ? (
        <>
          <link
            rel="preload"
            as="image"
            media={MOBILE_MEDIA}
            fetchPriority="high"
            imageSrcSet={mobileProps.srcSet}
            imageSizes={mobileProps.sizes}
          />
          <link
            rel="preload"
            as="image"
            media={DESKTOP_MEDIA}
            fetchPriority="high"
            imageSrcSet={desktopProps.srcSet}
            imageSizes={desktopProps.sizes}
          />
        </>
      ) : null}
      <picture>
        <source media={MOBILE_MEDIA} srcSet={mobileProps.srcSet} sizes={mobileProps.sizes} />
        {/* alt is supplied via desktopProps (spread); the optimizer-built <img>
            is intentional here. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...desktopProps} className={className} onLoad={onReady} onError={onReady} />
      </picture>
    </>
  );
}

export function ResponsiveImage({
  image,
  className,
  imgClassName = "h-auto w-full",
  sizes = "100vw",
  priority,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const onReady = () => setLoaded(true);

  const desktop = image?.desktop;
  if (!desktop?.url) return null;

  const alt = image.altText ?? image.title ?? "";
  const isPriority = priority ?? image.priority ?? false;
  const mobile = image.mobile;

  return (
    <figure className={`relative ${className ?? ""}`.trim()}>
      <span
        aria-hidden
        className={`ds-skeleton pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      {mobile?.url && !isSvg(desktop) && !isSvg(mobile) ? (
        <ArtDirected
          desktop={desktop}
          mobile={mobile}
          alt={alt}
          sizes={sizes}
          priority={isPriority}
          className={`${imgClassName} relative`}
          onReady={onReady}
        />
      ) : mobile?.url ? (
        // At least one asset is an SVG: keep the simple CSS-swapped pair (SVGs
        // bypass the optimizer, so there's nothing to art-direct via srcset).
        <>
          <span className="relative hidden md:block">
            <Asset asset={desktop} alt={alt} sizes={sizes} priority={isPriority} className={imgClassName} onReady={onReady} />
          </span>
          <span className="relative block md:hidden">
            <Asset asset={mobile} alt={alt} sizes={sizes} priority={isPriority} className={imgClassName} onReady={onReady} />
          </span>
        </>
      ) : (
        <Asset
          asset={desktop}
          alt={alt}
          sizes={sizes}
          priority={isPriority}
          className={`${imgClassName} relative`}
          onReady={onReady}
        />
      )}
      {image.caption ? (
        <figcaption className="relative mt-2 text-sm text-[var(--text-muted)]">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}

export default ResponsiveImage;
