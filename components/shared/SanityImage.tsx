import Image from "next/image";
import type { ComponentProps } from "react";

import type { SanityImage as SanityImageType } from "@/sanity/blocks";
import { hotspotPosition, urlFor } from "@/sanity/image";

type NextImageProps = Omit<ComponentProps<typeof Image>, "src" | "alt">;

type Props = NextImageProps & {
  image: SanityImageType | null | undefined;
  /** Falls back to the image's authored alt text. Pass "" for decorative use. */
  alt?: string;
  /** Honour the editor's hotspot as the CSS object-position (fill crops). */
  useHotspot?: boolean;
};

/** Renders a Sanity image through next/image, carrying the asset's LQIP
 * through as the blur placeholder so full-bleed art fades in as designed. */
export default function SanityImage({
  image,
  alt,
  useHotspot = false,
  style,
  ...rest
}: Props) {
  if (!image?.asset?._id) return null;

  const lqip = image.asset.metadata?.lqip;

  return (
    <Image
      src={urlFor(image).auto("format").url()}
      alt={alt ?? image.alt ?? ""}
      {...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {})}
      style={
        useHotspot
          ? { objectPosition: hotspotPosition(image), ...style }
          : style
      }
      {...rest}
    />
  );
}
