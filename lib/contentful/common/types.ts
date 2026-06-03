import type { Document } from "@contentful/rich-text-types";

/**
 * Shared types for the reusable "common" component entries (Cta, Image, Video)
 * and Rich Text. These are building blocks embedded inside sections and rich
 * text — they are not page sections themselves. GraphQL fragments live in
 * `lib/contentful/graphql/fragments/`, components in `components/common/`.
 */

export type AssetEntry = {
  sys?: { id: string };
  url?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  description?: string | null;
  contentType?: string | null;
};

/* ---------------------------------- CTA ---------------------------------- */

export type CtaVariant = "Red" | "Gray";
export type CtaSize = "Small" | "Medium" | "Large";
export type CtaLinkBehavior = "Internal" | "External" | "Download";

export type CtaEntry = {
  __typename?: "Cta";
  sys: { id: string };
  /** Editor-facing identifier (display field); not rendered. */
  internalName?: string | null;
  label?: string | null;
  /** Visual variant, ported from the old site's SpotlightButton. */
  variant?: CtaVariant | string | null;
  size?: CtaSize | string | null;
  linkBehavior?: CtaLinkBehavior | string | null;
  newTab?: boolean | null;
  showArrow?: boolean | null;
  fullWidth?: boolean | null;
  externalLink?: string | null;
  internalLink?: { __typename?: string; slug?: string | null } | null;
  downloadableAsset?: { url?: string | null } | null;
};

/* --------------------------------- Image --------------------------------- */

export type ImageEntry = {
  __typename?: "Image";
  sys: { id: string };
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  priority?: boolean | null;
  desktop?: AssetEntry | null;
  mobile?: AssetEntry | null;
};

/* --------------------------------- Video --------------------------------- */

export type VideoType = "Self Hosted" | "YouTube" | "Vimeo";

export type VideoEntry = {
  __typename?: "Video";
  sys: { id: string };
  title?: string | null;
  altText?: string | null;
  videoType?: VideoType | string | null;
  youtubeId?: string | null;
  vimeoId?: string | null;
  autoplay?: boolean | null;
  loop?: boolean | null;
  muted?: boolean | null;
  controls?: boolean | null;
  selfHostedSource?: AssetEntry | null;
  posterImage?: AssetEntry | null;
};

/* ----------------------------- Pricing Plan ------------------------------ */

export type PricingPlanEntry = {
  sys: { id: string };
  name?: string | null;
  description?: string | null;
  price?: string | null;
  priceSuffix?: string | null;
  features?: Array<string | null> | null;
  isPopular?: boolean | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
};

/* ----------------------------- Accordion Item ---------------------------- */

export type AccordionItemEntry = {
  sys: { id: string };
  question?: string | null;
  answer?: RichTextField | null;
  image?: ImageEntry | null;
  video?: VideoEntry | null;
  cta?: CtaEntry | null;
};

/* -------------------------------- Review --------------------------------- */

export type ReviewEntry = {
  sys: { id: string };
  authorName?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  quote?: string | null;
  timeAgo?: string | null;
};

/* ------------------------------- Rich Text ------------------------------- */

/**
 * An entry embedded in rich text — could be any of our common component types.
 * `__typename` and `sys` are omitted from the per-type partials because each
 * type declares a different `__typename` literal (intersecting them collapses
 * to `never`); they are declared once here instead.
 */
export type RichTextLinkEntry = {
  __typename?: string;
  sys: { id: string };
} & Partial<Omit<CtaEntry, "__typename" | "sys">> &
  Partial<Omit<ImageEntry, "__typename" | "sys">> &
  Partial<Omit<VideoEntry, "__typename" | "sys">>;

export type RichTextHyperlinkEntry = {
  __typename?: string;
  sys: { id: string };
  slug?: string | null;
};

/** Shape returned by a `<field> { json links { ... } }` query. */
export type RichTextField = {
  json: Document;
  links?: {
    entries?: {
      block?: Array<RichTextLinkEntry | null> | null;
      inline?: Array<RichTextLinkEntry | null> | null;
      hyperlink?: Array<RichTextHyperlinkEntry | null> | null;
    } | null;
    assets?: {
      block?: Array<(AssetEntry & { sys: { id: string } }) | null> | null;
      hyperlink?: Array<(AssetEntry & { sys: { id: string } }) | null> | null;
    } | null;
  } | null;
};
