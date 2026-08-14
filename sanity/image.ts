import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** Turns a Sanity hotspot into a CSS `object-position`, so editors control the
 * crop that stays in frame on full-bleed images. */
export function hotspotPosition(
  source: { hotspot?: { x?: number; y?: number } | null } | null | undefined,
): string {
  const { x, y } = source?.hotspot ?? {};
  if (typeof x !== "number" || typeof y !== "number") return "50% 50%";
  return `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`;
}
