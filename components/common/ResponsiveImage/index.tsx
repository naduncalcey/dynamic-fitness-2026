"use client";

import NextImage from "next/image";
import { useState } from "react";
import type { AssetEntry, ImageEntry } from "@/lib/contentful/common/types";

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
      {mobile?.url ? (
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
