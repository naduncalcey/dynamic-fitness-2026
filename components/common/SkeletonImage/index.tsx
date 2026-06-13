"use client";

import NextImage from "next/image";
import { useState } from "react";

/**
 * Renders an image with an animated skeleton placeholder shown until it loads.
 * The skeleton sits behind the image (`absolute inset-0`); the image paints over
 * it and the skeleton fades out on load. The image's own opacity is left
 * untouched, so a cached image that loads before hydration is never stuck hidden.
 *
 * Renders the image element internally (rather than cloning a child) so it works
 * from Server Components too — elements passed across the server→client boundary
 * can't be cloned/inspected. Three kinds:
 *   - `intrinsic` (default): next/image with width/height.
 *   - `fill`: next/image with `fill` — `wrapperClassName` must be the sized,
 *     positioned box (e.g. `absolute inset-0`).
 *   - `plain`: a plain <img>, for SVGs / external avatars not run through
 *     next/image's optimizer.
 */

type CommonProps = {
  src: string;
  alt: string;
  /** Classes for the image element (object-fit, sizing, hover, …). */
  className?: string;
  /** Classes for the wrapper box. */
  wrapperClassName?: string;
  /** Extra skeleton classes, e.g. `rounded-full` for avatars. */
  skeletonClassName?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
};

type SkeletonImageProps =
  | (CommonProps & { kind: "plain" })
  | (CommonProps & { kind: "fill"; sizes?: string })
  | (CommonProps & { kind?: "intrinsic"; width: number; height: number; sizes?: string });

export function SkeletonImage(props: SkeletonImageProps) {
  const {
    src,
    alt,
    className = "",
    wrapperClassName = "",
    skeletonClassName = "",
    priority,
  } = props;
  const [loaded, setLoaded] = useState(false);
  const done = () => setLoaded(true);

  const skeleton = (
    <span
      aria-hidden
      className={`ds-skeleton pointer-events-none absolute inset-0 transition-opacity duration-500 ${
        loaded ? "opacity-0" : "opacity-100"
      } ${skeletonClassName}`.trim()}
    />
  );

  if (props.kind === "plain") {
    return (
      <span className={`relative block ${wrapperClassName}`.trim()}>
        {skeleton}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={props.loading ?? (priority ? "eager" : "lazy")}
          onLoad={done}
          onError={done}
          className={`relative ${className}`.trim()}
        />
      </span>
    );
  }

  if (props.kind === "fill") {
    return (
      <span className={wrapperClassName}>
        {skeleton}
        <NextImage
          src={src}
          alt={alt}
          fill
          sizes={props.sizes ?? "100vw"}
          priority={priority}
          onLoad={done}
          onError={done}
          className={className}
        />
      </span>
    );
  }

  return (
    <span className={`relative block ${wrapperClassName}`.trim()}>
      {skeleton}
      <NextImage
        src={src}
        alt={alt}
        width={props.width}
        height={props.height}
        sizes={props.sizes ?? "100vw"}
        priority={priority}
        onLoad={done}
        onError={done}
        className={`relative ${className}`.trim()}
      />
    </span>
  );
}

export default SkeletonImage;
