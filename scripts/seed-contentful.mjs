#!/usr/bin/env node
/*
 * One-shot seed script for the Contentful space.
 *
 * Creates (or updates) two content types:
 *   - seo
 *   - flexiblePage
 *
 * Then creates and publishes two sample entries so the `/` route renders:
 *   - entry id "seo-home"  (seo)
 *   - entry id "home"      (flexiblePage, slug = "/")
 *
 * Env vars (read from .env.local, which sits in the project root next to package.json):
 *   CONTENTFUL_SPACE_ID            required
 *   CONTENTFUL_MANAGEMENT_TOKEN    required — CMA token, starts with CFPAT-, write access
 *   CONTENTFUL_ENVIRONMENT         optional, defaults to "master"
 *
 * Usage (from anywhere):
 *   node /path/to/project/scripts/seed-contentful.mjs
 *
 * The script resolves .env.local from its own location, so CWD doesn't matter.
 * Re-runnable: existing content types / entries are updated in place, not duplicated.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envFile = join(scriptDir, "..", ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const ENV = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CMA = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE) {
  console.error("✗ CONTENTFUL_SPACE_ID missing from .env.local.");
  process.exit(1);
}
if (!CMA) {
  console.error(
    "✗ CONTENTFUL_MANAGEMENT_TOKEN missing from .env.local.\n" +
      "  Generate a CMA token at:\n" +
      "    Contentful → Settings → API keys → Content management tokens\n" +
      "  Then add it to .env.local as:\n" +
      "    CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-xxx"
  );
  process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;

const api = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CMA}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`${opts.method || "GET"} ${path} → ${res.status}\n${text}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
};

const SEO_TYPE = {
  name: "SEO",
  description: "SEO metadata reused on FlexiblePage entries.",
  displayField: "seoTitle",
  fields: [
    { id: "seoTitle", name: "SEO Title", type: "Symbol" },
    { id: "seoDescription", name: "SEO Description", type: "Symbol" },
    { id: "seoOgImage", name: "OG Image", type: "Link", linkType: "Asset" },
    { id: "seoNoIndex", name: "No Index", type: "Boolean" },
    { id: "seoNoFollow", name: "No Follow", type: "Boolean" },
    { id: "seoCanonicalUrl", name: "Canonical URL", type: "Symbol" },
    { id: "seoSchemaMarkup", name: "Schema Markup (JSON)", type: "Object" },
  ],
};

const FLEXIBLE_PAGE_TYPE = {
  name: "Flexible Page",
  description: "A page assembled from a list of section entries, addressed by slug.",
  displayField: "pageTitle",
  fields: [
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [{ unique: true }],
    },
    { id: "pageTitle", name: "Page Title", type: "Symbol", required: true },
    {
      id: "seo",
      name: "SEO",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["seo"] }],
    },
    {
      id: "sections",
      name: "Sections",
      type: "Array",
      items: { type: "Link", linkType: "Entry", validations: [] },
    },
  ],
};

/*
 * Reusable "common" component content types embedded inside sections and rich
 * text: Cta, Image, Video. Keep these field ids in sync with the GraphQL
 * fragments in lib/contentful/graphql/fragments/ and the types in
 * lib/contentful/common/types.ts.
 */
const CTA_TYPE = {
  name: "CTA",
  description: "Reusable call-to-action button. Variants ported from the old site.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "label", name: "Label", type: "Symbol", required: true },
    {
      id: "variant",
      name: "Variant",
      type: "Symbol",
      validations: [{ in: ["Red", "Gray"] }],
    },
    {
      id: "size",
      name: "Size",
      type: "Symbol",
      validations: [{ in: ["Small", "Medium", "Large"] }],
    },
    {
      id: "linkBehavior",
      name: "Link Behavior",
      type: "Symbol",
      validations: [{ in: ["Internal", "External", "Download"] }],
    },
    { id: "newTab", name: "Open in New Tab", type: "Boolean" },
    { id: "showArrow", name: "Show Arrow", type: "Boolean" },
    { id: "fullWidth", name: "Full Width", type: "Boolean" },
    { id: "externalLink", name: "External Link", type: "Symbol" },
    {
      id: "internalLink",
      name: "Internal Link",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["flexiblePage"] }],
    },
    {
      id: "downloadableAsset",
      name: "Downloadable Asset",
      type: "Link",
      linkType: "Asset",
    },
  ],
};

const IMAGE_TYPE = {
  name: "Image",
  description: "Reusable image with an optional art-directed mobile asset.",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    { id: "altText", name: "Alt Text", type: "Symbol" },
    { id: "caption", name: "Caption", type: "Symbol" },
    { id: "priority", name: "Priority (eager load)", type: "Boolean" },
    {
      id: "desktop",
      name: "Desktop Asset",
      type: "Link",
      linkType: "Asset",
      required: true,
    },
    { id: "mobile", name: "Mobile Asset", type: "Link", linkType: "Asset" },
  ],
};

const VIDEO_TYPE = {
  name: "Video",
  description: "Reusable video: self-hosted asset, YouTube, or Vimeo.",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    { id: "altText", name: "Alt Text", type: "Symbol" },
    {
      id: "videoType",
      name: "Video Type",
      type: "Symbol",
      validations: [{ in: ["Self Hosted", "YouTube", "Vimeo"] }],
    },
    { id: "youtubeId", name: "YouTube ID", type: "Symbol" },
    { id: "vimeoId", name: "Vimeo ID", type: "Symbol" },
    { id: "autoplay", name: "Autoplay", type: "Boolean" },
    { id: "loop", name: "Loop", type: "Boolean" },
    { id: "muted", name: "Muted", type: "Boolean" },
    { id: "controls", name: "Show Controls", type: "Boolean" },
    {
      id: "selfHostedSource",
      name: "Self-Hosted Source",
      type: "Link",
      linkType: "Asset",
    },
    {
      id: "posterImage",
      name: "Poster Image",
      type: "Link",
      linkType: "Asset",
    },
  ],
};

/*
 * Hero section. `frontEndComponent` selects the visual variant; references the
 * reusable image/video/cta component types. Keep in sync with
 * lib/sections/types.ts (HeroSection) and the Hero GraphQL query.
 */
const HERO_TYPE = {
  name: "Hero",
  description: "Hero section with headline, highlight, optional background media and CTAs.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [{ in: ["Hero - default"] }],
    },
    { id: "eyebrow", name: "Eyebrow", type: "Symbol" },
    { id: "headline", name: "Headline", type: "Symbol", required: true },
    { id: "highlightText", name: "Highlight Text", type: "Symbol" },
    { id: "subheading", name: "Subheading", type: "RichText" },
    {
      id: "backgroundImage",
      name: "Background Image",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["image"] }],
    },
    {
      id: "backgroundVideo",
      name: "Background Video",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["video"] }],
    },
    {
      id: "ctas",
      name: "CTAs",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["cta"] }],
      },
    },
  ],
};

/*
 * Info section (the old site's "About"). `frontEndComponent` selects the
 * variant; references reusable cta + image component types. Keep in sync with
 * lib/sections/types.ts (InfoSection) and the Info GraphQL query.
 */
const INFO_TYPE = {
  name: "Info",
  description: "Editorial info section (number/label, split headline, description, CTA, image gallery).",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [
        { in: ["Info - Image Explainer", "Info - Pricing", "Info - Default"] },
      ],
    },
    // --- Default group (rich text article) ---
    { id: "body", name: "Body", type: "RichText" },
    // --- Image Explainer group ---
    { id: "sectionNumber", name: "Section Number", type: "Symbol" },
    { id: "sectionLabel", name: "Section Label", type: "Symbol" },
    { id: "headline", name: "Headline", type: "Symbol" },
    { id: "headlineFaded", name: "Headline (Faded)", type: "Symbol" },
    { id: "description", name: "Description", type: "RichText" },
    {
      id: "imageTooltips",
      name: "Image Tooltips",
      type: "Array",
      items: { type: "Symbol" },
    },
    {
      id: "cta",
      name: "CTA",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["cta"] }],
    },
    {
      id: "mainImage",
      name: "Main Image",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["image"] }],
    },
    {
      id: "galleryImages",
      name: "Gallery Images",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["image"] }],
      },
    },
    // --- Pricing group (reuses sectionNumber/sectionLabel/headline/headlineFaded above) ---
    { id: "coupleDiscountLabel", name: "Couple Discount Label", type: "Symbol" },
    {
      id: "individualPlans",
      name: "Individual Plans",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["pricingPlan"] }],
      },
    },
    {
      id: "couplePlans",
      name: "Couple Plans",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["pricingPlan"] }],
      },
    },
  ],
};

/*
 * Pricing plan — one card in the Info "Info - Pricing" variant.
 */
const PRICING_PLAN_TYPE = {
  name: "Pricing Plan",
  description: "A single pricing plan/card referenced by an Info (pricing) section.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "name", name: "Plan Name", type: "Symbol" },
    { id: "description", name: "Description", type: "Symbol" },
    { id: "price", name: "Price", type: "Symbol" },
    { id: "priceSuffix", name: "Price Suffix", type: "Symbol" },
    {
      id: "features",
      name: "Features",
      type: "Array",
      items: { type: "Symbol" },
    },
    { id: "isPopular", name: "Is Popular", type: "Boolean" },
    { id: "ctaLabel", name: "CTA Label", type: "Symbol" },
    { id: "ctaLink", name: "CTA Link", type: "Symbol" },
  ],
};

/*
 * Review — one customer testimonial card, referenced by the Testimonial section.
 */
const REVIEW_TYPE = {
  name: "Review",
  description: "A single customer review shown in the Testimonial section.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "authorName", name: "Author Name", type: "Symbol" },
    { id: "avatarUrl", name: "Avatar URL", type: "Symbol" },
    { id: "rating", name: "Rating (1-5)", type: "Integer" },
    { id: "quote", name: "Quote", type: "Text" },
    { id: "timeAgo", name: "Time Ago", type: "Symbol" },
  ],
};

/*
 * Testimonial section — an auto-rotating carousel of Review entries.
 */
const TESTIMONIAL_TYPE = {
  name: "Testimonial",
  description: "Testimonial section: a rotating carousel of customer reviews.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [{ in: ["Testimonial - Default"] }],
    },
    {
      id: "testimonials",
      name: "Reviews",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["review"] }],
      },
    },
  ],
};

/*
 * Accordion item — one question/answer row, referenced by the Accordion section.
 */
const ACCORDION_ITEM_TYPE = {
  name: "Accordion Item",
  description: "A single question/answer row in an Accordion section.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "question", name: "Question", type: "Symbol" },
    { id: "answer", name: "Answer", type: "RichText" },
    {
      id: "image",
      name: "Image",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["image"] }],
    },
    {
      id: "video",
      name: "Video",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["video"] }],
    },
    {
      id: "cta",
      name: "CTA",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["cta"] }],
    },
  ],
};

/*
 * Accordion section (the old site's FAQ). Intro column + expandable item list.
 */
const ACCORDION_TYPE = {
  name: "Accordion",
  description: "Accordion section: intro column + a list of expandable items (e.g. FAQ).",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [{ in: ["Accordion - FAQ", "Accordion - Steps"] }],
    },
    { id: "sectionNumber", name: "Section Number", type: "Symbol" },
    { id: "sectionLabel", name: "Section Label", type: "Symbol" },
    { id: "headline", name: "Headline", type: "Symbol" },
    { id: "description", name: "Description", type: "RichText" },
    {
      id: "cta",
      name: "CTA",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["cta"] }],
    },
    {
      id: "items",
      name: "Items",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["accordionItem"] }],
      },
    },
  ],
};

/*
 * Banner section (the old site's closing CTA). Background image + overlay,
 * headline with a highlighted word, description, and a CTA. Reuses cta + image.
 */
const BANNER_TYPE = {
  name: "Banner",
  description: "Banner section: background image + overlay, headline, description, CTA.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [{ in: ["Banner - CTA"] }],
    },
    { id: "headline", name: "Headline", type: "Symbol" },
    { id: "highlightWord", name: "Highlight Word", type: "Symbol" },
    { id: "description", name: "Description", type: "RichText" },
    {
      id: "cta",
      name: "CTA",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["cta"] }],
    },
    {
      id: "backgroundImage",
      name: "Background Image",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["image"] }],
    },
  ],
};

/*
 * Careers form section. Holds the editable form copy + position options. The
 * form posts to /api/careers, which emails the application + CV via Resend.
 */
const CAREERS_FORM_TYPE = {
  name: "Careers Form",
  description: "Careers application form: intro copy, position options, success message.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [{ in: ["Careers Form"] }],
    },
    { id: "heading", name: "Heading", type: "Symbol" },
    { id: "description", name: "Description", type: "RichText" },
    {
      id: "positions",
      name: "Positions",
      type: "Array",
      items: { type: "Symbol" },
    },
    { id: "successMessage", name: "Success Message", type: "Symbol" },
  ],
};

/*
 * Blog author — referenced by blog posts. avatarUrl is an external image URL.
 */
const AUTHOR_TYPE = {
  name: "Author",
  description: "Blog author (name, role, avatar).",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "name", name: "Name", type: "Symbol" },
    { id: "role", name: "Role", type: "Symbol" },
    { id: "avatarUrl", name: "Avatar URL", type: "Symbol" },
  ],
};

/*
 * Blog post (detail page). Addressed by slug at /blog/<slug>; reuses image,
 * author, and seo. Body is Rich Text (can embed Cta/Image/Video).
 */
const BLOG_POST_TYPE = {
  name: "Blog Post",
  description: "An individual blog post, rendered at /blog/<slug>.",
  displayField: "title",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "title", name: "Title", type: "Symbol", required: true },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [{ unique: true }],
    },
    { id: "excerpt", name: "Excerpt", type: "Symbol" },
    { id: "category", name: "Category", type: "Symbol" },
    { id: "publishedDate", name: "Published Date", type: "Date" },
    {
      id: "coverImage",
      name: "Cover Image",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["image"] }],
    },
    {
      id: "author",
      name: "Author",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["author"] }],
    },
    { id: "body", name: "Body", type: "RichText" },
    {
      id: "seo",
      name: "SEO",
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["seo"] }],
    },
  ],
};

/*
 * Blog listing section — placed on the /blog page; lists blog posts.
 */
const BLOG_LISTING_TYPE = {
  name: "Blog Listing",
  description: "Blog index section: heading/intro + a grid of the latest posts.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Frontend Component",
      type: "Symbol",
      validations: [{ in: ["Blog Listing - Default"] }],
    },
    { id: "heading", name: "Heading", type: "Symbol" },
    { id: "description", name: "Description", type: "RichText" },
  ],
};

const publishContentType = async (id, version) => {
  await api(`/content_types/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(version) },
  });
};

const upsertContentType = async (id, spec) => {
  let version;
  let existing;
  try {
    existing = await api(`/content_types/${id}`);
    version = existing.sys.version;
    console.log(`• content type "${id}" exists (v${version}) → updating`);
  } catch (e) {
    if (e.status !== 404) throw e;
    console.log(`• content type "${id}" → creating`);
  }

  // Contentful requires a field to be omitted (and published) before it can be
  // deleted, and a field's TYPE cannot be changed in place — it must be deleted
  // and recreated. Detect removed fields and type-changed fields, then purge
  // them (omit → delete) so the final PUT can re-add the type-changed ones with
  // their new type. Field ids are matched by apiName.
  if (existing) {
    const specById = new Map(spec.fields.map((f) => [f.id, f]));
    const exId = (f) => f.apiName ?? f.id;
    const toRemove = existing.fields.filter((f) => !specById.has(exId(f)) && !f.omitted);
    const typeChanged = existing.fields.filter((f) => {
      const s = specById.get(exId(f));
      return s && s.type !== f.type;
    });
    const purge = [...toRemove, ...typeChanged];

    if (purge.length) {
      const changedIds = new Set(typeChanged.map(exId));
      // Spec fields that keep their type (exclude type-changed ids — their old
      // versions are purged below and re-added by the final PUT).
      const stableSpecFields = spec.fields.filter((f) => !changedIds.has(f.id));

      // Phase 1 — omit the purged fields.
      const omitRes = await api(`/content_types/${id}`, {
        method: "PUT",
        headers: { "X-Contentful-Version": String(version) },
        body: JSON.stringify({
          ...spec,
          fields: [...stableSpecFields, ...purge.map((f) => ({ ...f, omitted: true }))],
        }),
      });
      await publishContentType(id, omitRes.sys.version);
      version = (await api(`/content_types/${id}`)).sys.version;

      // Phase 2 — delete them (drop from the field array).
      const delRes = await api(`/content_types/${id}`, {
        method: "PUT",
        headers: { "X-Contentful-Version": String(version) },
        body: JSON.stringify({ ...spec, fields: stableSpecFields }),
      });
      await publishContentType(id, delRes.sys.version);
      version = (await api(`/content_types/${id}`)).sys.version;
      console.log(`  · purged ${purge.map(exId).join(", ")}`);
    }
  }

  const result = await api(`/content_types/${id}`, {
    method: "PUT",
    headers: version ? { "X-Contentful-Version": String(version) } : {},
    body: JSON.stringify(spec),
  });
  await publishContentType(id, result.sys.version);
  console.log(`  ✓ published "${id}"`);
};

await upsertContentType("seo", SEO_TYPE);
await upsertContentType("flexiblePage", FLEXIBLE_PAGE_TYPE);
// Reusable common components (cta.internalLink → flexiblePage, so order matters).
await upsertContentType("cta", CTA_TYPE);
await upsertContentType("image", IMAGE_TYPE);
await upsertContentType("video", VIDEO_TYPE);
await upsertContentType("hero", HERO_TYPE);
await upsertContentType("pricingPlan", PRICING_PLAN_TYPE);
await upsertContentType("info", INFO_TYPE);
await upsertContentType("review", REVIEW_TYPE);
await upsertContentType("testimonial", TESTIMONIAL_TYPE);
await upsertContentType("accordionItem", ACCORDION_ITEM_TYPE);
await upsertContentType("accordion", ACCORDION_TYPE);
await upsertContentType("banner", BANNER_TYPE);
await upsertContentType("careersForm", CAREERS_FORM_TYPE);
await upsertContentType("author", AUTHOR_TYPE);
await upsertContentType("blogPost", BLOG_POST_TYPE);
await upsertContentType("blogListing", BLOG_LISTING_TYPE);

const locales = await api("/locales");
const defaultLocale =
  locales.items.find((l) => l.default)?.code ||
  locales.items[0]?.code ||
  "en-US";
const L = (v) => ({ [defaultLocale]: v });

const upsertEntry = async (contentType, id, fields) => {
  let version;
  try {
    const existing = await api(`/entries/${id}`);
    version = existing.sys.version;
    console.log(`• entry "${id}" exists (v${version}) → updating`);
  } catch (e) {
    if (e.status !== 404) throw e;
    console.log(`• entry "${id}" → creating`);
  }
  const result = await api(`/entries/${id}`, {
    method: "PUT",
    headers: {
      "X-Contentful-Content-Type": contentType,
      ...(version ? { "X-Contentful-Version": String(version) } : {}),
    },
    body: JSON.stringify({ fields }),
  });
  await api(`/entries/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(result.sys.version) },
  });
  console.log(`  ✓ published "${id}"`);
};

const entryLink = (id) => ({ sys: { type: "Link", linkType: "Entry", id } });
const assetLink = (id) => ({ sys: { type: "Link", linkType: "Asset", id } });

// --- Rich Text document builders (Contentful rich text JSON) ---
const rtText = (value) => ({ nodeType: "text", value, marks: [], data: {} });
const rtP = (value) => ({ nodeType: "paragraph", data: {}, content: [rtText(value)] });
const rtH = (level, value) => ({
  nodeType: `heading-${level}`,
  data: {},
  content: [rtText(value)],
});
const rtLi = (value) => ({
  nodeType: "list-item",
  data: {},
  content: [rtP(value)],
});
const rtUl = (values) => ({
  nodeType: "unordered-list",
  data: {},
  content: values.map(rtLi),
});
const rtDoc = (...content) => ({ nodeType: "document", data: {}, content });
// Inline hyperlink + a paragraph that accepts mixed inline content (text + links).
const rtLink = (uri, value) => ({
  nodeType: "hyperlink",
  data: { uri },
  content: [rtText(value)],
});
const rtPara = (...content) => ({ nodeType: "paragraph", data: {}, content });

const CONTACT_EMAIL = "mailto:nadun.n@dynamicfitness.lk";
const teamLink = rtLink("Dynamic Fitness team", CONTACT_EMAIL);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Upload a local file as a Contentful asset (create → process → publish) and
 * return its id. Idempotent: if the asset already has a processed file, the
 * upload is skipped.
 */
const upsertAsset = async (id, { title, fileName, contentType, filePath }) => {
  let version;
  try {
    const existing = await api(`/assets/${id}`);
    if (existing.fields?.file?.[defaultLocale]?.url) {
      console.log(`• asset "${id}" exists → skipping upload`);
      return id;
    }
    version = existing.sys.version;
  } catch (e) {
    if (e.status !== 404) throw e;
  }

  // 1. Upload the binary to the space-scoped upload host.
  const bytes = readFileSync(filePath);
  const upRes = await fetch(`https://upload.contentful.com/spaces/${SPACE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CMA}`,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });
  if (!upRes.ok) {
    throw new Error(`upload failed for ${id}: ${upRes.status}\n${await upRes.text()}`);
  }
  const uploadId = (await upRes.json()).sys.id;
  console.log(`• asset "${id}" → uploaded (${bytes.length} bytes)`);

  // 2. Create/replace the asset referencing the upload.
  const created = await api(`/assets/${id}`, {
    method: "PUT",
    headers: version ? { "X-Contentful-Version": String(version) } : {},
    body: JSON.stringify({
      fields: {
        title: { [defaultLocale]: title },
        file: {
          [defaultLocale]: {
            contentType,
            fileName,
            uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } },
          },
        },
      },
    }),
  });

  // 3. Process the file (async), then poll until the CDN url appears.
  await api(`/assets/${id}/files/${defaultLocale}/process`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(created.sys.version) },
  });
  let processed;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    processed = await api(`/assets/${id}`);
    if (processed.fields?.file?.[defaultLocale]?.url) break;
  }
  if (!processed?.fields?.file?.[defaultLocale]?.url) {
    throw new Error(`asset ${id} did not finish processing in time`);
  }

  // 4. Publish.
  await api(`/assets/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(processed.sys.version) },
  });
  console.log(`  ✓ published asset "${id}"`);
  return id;
};

await upsertEntry("seo", "seo-home", {
  seoTitle: L("Dynamic Fitness — Unleash Your Potential"),
  seoDescription: L(
    "Personal training, group classes, and nutrition coaching at Dynamic Fitness."
  ),
});

// Sample CTA, referenced by the Hero below.
await upsertEntry("cta", "cta-sample", {
  internalName: L("Home Hero — Book Consultation"),
  label: L("Book a Free Consultation"),
  variant: L("Red"),
  size: L("Medium"),
  linkBehavior: L("External"),
  externalLink: L("https://calendly.com/nadun-n-dynamicfitness/30min"),
  newTab: L(true),
  showArrow: L(false),
});

// Sample Hero, wired onto the home page. Recreates the old site's hero copy.
// No subheading — matches the live dynamicfitness.lk hero (headline + CTA only).
await upsertEntry("hero", "hero-home", {
  internalName: L("Home Hero"),
  frontEndComponent: L("Hero - default"),
  headline: L("Unleash Your Potential at"),
  highlightText: L("Dynamic Fitness"),
  ctas: L([entryLink("cta-sample")]),
});

// --- Info ("About") section: upload gallery assets, then image entries ---
const OLD_PUBLIC = "/Users/e25test/Documents/Dump/dynamic-fitness-2026/public";

await upsertAsset("asset-about-main", {
  title: "Dynamic Fitness facility",
  fileName: "output.webp",
  contentType: "image/webp",
  filePath: `${OLD_PUBLIC}/output.webp`,
});
await upsertAsset("asset-about-1", {
  title: "Dynamic Fitness — Strength Zone",
  fileName: "promo-1.webp",
  contentType: "image/webp",
  filePath: `${OLD_PUBLIC}/promo-1.webp`,
});
await upsertAsset("asset-about-2", {
  title: "Dynamic Fitness — Strength Zone 2",
  fileName: "promo-2.webp",
  contentType: "image/webp",
  filePath: `${OLD_PUBLIC}/promo-2.webp`,
});
await upsertAsset("asset-about-3", {
  title: "Dynamic Fitness — Cardio Area",
  fileName: "promo-3.webp",
  contentType: "image/webp",
  filePath: `${OLD_PUBLIC}/promo-3.webp`,
});

await upsertEntry("image", "img-about-main", {
  title: L("Our Facility"),
  altText: L("Dynamic Fitness facility interior"),
  desktop: L(assetLink("asset-about-main")),
});
await upsertEntry("image", "img-about-1", {
  title: L("Strength Zone"),
  altText: L("Strength training zone"),
  desktop: L(assetLink("asset-about-1")),
});
await upsertEntry("image", "img-about-2", {
  title: L("Strength Zone 2"),
  altText: L("Strength training area"),
  desktop: L(assetLink("asset-about-2")),
});
await upsertEntry("image", "img-about-3", {
  title: L("Cardio Area"),
  altText: L("Cardio area"),
  desktop: L(assetLink("asset-about-3")),
});

// "Set Route" CTA (red, no arrow) — links to the gym's Google Maps directions.
await upsertEntry("cta", "cta-set-route", {
  internalName: L("About — Set Route"),
  label: L("Set Route"),
  variant: L("Red"),
  size: L("Medium"),
  linkBehavior: L("External"),
  externalLink: L(
    "https://www.google.com/maps/dir//Dynamic+Fitness+(Pvt)+Ltd,+14+Sri+Devananda+Rd,+Maharagama+10280/@6.8523328,79.912721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ae25b00267d1985:0xc9c0845e8629e66b!2m2!1d79.9138617!2d6.8553051?entry=ttu"
  ),
  newTab: L(true),
  showArrow: L(false),
});

// Info ("About") section, wired onto the home page after the Hero.
await upsertEntry("info", "info-about", {
  internalName: L("Home About"),
  frontEndComponent: L("Info - Image Explainer"),
  sectionNumber: L("01"),
  sectionLabel: L("State of the Art Fitness Center"),
  headline: L("Built for"),
  headlineFaded: L("Transformations"),
  description: L(
    rtDoc(
      rtP(
        "Transform your workouts and redefine your limits at Dynamic Fitness, where innovation meets inspiration. Elevate your fitness game today and discover the dynamic difference"
      )
    )
  ),
  imageTooltips: L(["Our Facility", "Strength Zone", "Strength Zone", "Cardio Area"]),
  cta: L(entryLink("cta-set-route")),
  mainImage: L(entryLink("img-about-main")),
  galleryImages: L([
    entryLink("img-about-1"),
    entryLink("img-about-2"),
    entryLink("img-about-3"),
  ]),
});

// --- Pricing ("membership") section ---
const PRICING_CTA_LINK = "https://fitconnect.me/download?o=DFG&b=MAH";

const pricingPlan = (id, p) =>
  upsertEntry("pricingPlan", id, {
    internalName: L(p.internalName),
    name: L(p.name),
    description: L(p.description),
    price: L(p.price),
    priceSuffix: L(p.priceSuffix ?? ""),
    features: L(p.features),
    isPopular: L(Boolean(p.popular)),
    ctaLabel: L("Get Started"),
    ctaLink: L(PRICING_CTA_LINK),
  });

await pricingPlan("plan-monthly", {
  internalName: "Individual — Monthly",
  name: "Monthly",
  description: "Best for beginners",
  price: "රු 6,000",
  priceSuffix: "/mo",
  features: [
    "Full gym access",
    "Locker room & showers",
    "1 Free HIIT class per week",
    "Access to Fitconnect",
  ],
});
await pricingPlan("plan-3months", {
  internalName: "Individual — 3 Months",
  name: "3 Months",
  description: "For serious athletes",
  price: "රු 15,000",
  features: ["Everything in monthly", "Unlimited HIIT classes", "Nutrition guidance"],
});
await pricingPlan("plan-6months", {
  internalName: "Individual — 6 Months",
  name: "6 Months",
  description: "Maximum results, zero limits",
  price: "රු 28,000",
  popular: true,
  features: ["Everything in 3 months", "Custom meal plans"],
});
await pricingPlan("plan-12months", {
  internalName: "Individual — 12 Months",
  name: "12 Months",
  description: "For gym junkies",
  price: "රු 42,000",
  features: ["Everything in 6 months"],
});
await pricingPlan("plan-couple-6", {
  internalName: "Couple — 6 Months",
  name: "6 Months - Couple",
  description: "Best value for couples",
  price: "රු 38,000",
  popular: true,
  features: [
    "Full gym access",
    "Locker room & showers",
    "1 Free HIIT class per week",
    "Access to Fitconnect",
  ],
});
await pricingPlan("plan-couple-12", {
  internalName: "Couple — 12 Months",
  name: "12 Months - Couple",
  description: "Ultimate duo commitment",
  price: "රු 58,000",
  features: ["Everything in 6 months"],
});

await upsertEntry("info", "info-pricing", {
  internalName: L("Home Pricing"),
  frontEndComponent: L("Info - Pricing"),
  sectionNumber: L("02"),
  sectionLabel: L("Select Plan"),
  headline: L("Choose your"),
  headlineFaded: L("membership"),
  coupleDiscountLabel: L("Save 15%"),
  individualPlans: L([
    entryLink("plan-monthly"),
    entryLink("plan-3months"),
    entryLink("plan-6months"),
    entryLink("plan-12months"),
  ]),
  couplePlans: L([entryLink("plan-couple-6"), entryLink("plan-couple-12")]),
});

// --- Testimonial section: customer reviews ---
await upsertEntry("review", "review-1", {
  internalName: L("Review — Imasha Sashini"),
  authorName: L("Imasha Sashini"),
  avatarUrl: L(
    "https://api.dicebear.com/9.x/notionists/svg?seed=Imasha%20Sashini&backgroundColor=ededed&beardProbability=0"
  ),
  rating: L(5),
  quote: L(
    "Dynamic Fitness is a great place to workout. The trainers are experienced, supportive, and really focus on proper technique and motivation. The training sessions are well-structured and effective. Plus, the membership charges are very reasonable for the quality of service provided."
  ),
  timeAgo: L("7 months ago"),
});
await upsertEntry("review", "review-2", {
  internalName: L("Review — Rajitha Abeysinghe"),
  authorName: L("Rajitha Abeysinghe"),
  avatarUrl: L(
    "https://api.dicebear.com/9.x/notionists/svg?seed=Rajitha%20Abeysinghe&backgroundColor=ededed&beardProbability=100"
  ),
  rating: L(5),
  quote: L(
    "Best gym around Nawinna. Modern equipments, clean facility + friendly and knowledgeable trainers. Highly recommended if you are looking for a gym around Nawinna area."
  ),
  timeAgo: L("a year ago"),
});
await upsertEntry("review", "review-3", {
  internalName: L("Review — Sasindu Mendis"),
  authorName: L("Sasindu Mendis"),
  avatarUrl: L(
    "https://api.dicebear.com/9.x/notionists/svg?seed=Sasindu%20Mendis&backgroundColor=ededed"
  ),
  rating: L(5),
  quote: L(
    "Easily accessible location right by the high-level road, friendly, welcoming and supportive people regardless you're a pro or beginner, good range of equipment, loves the place and vibe!"
  ),
  timeAgo: L("a year ago"),
});

await upsertEntry("testimonial", "testimonial-home", {
  internalName: L("Home Testimonials"),
  frontEndComponent: L("Testimonial - Default"),
  testimonials: L([
    entryLink("review-1"),
    entryLink("review-2"),
    entryLink("review-3"),
  ]),
});

// --- FAQ (Accordion) section ---
await upsertEntry("cta", "cta-contact-us", {
  internalName: L("FAQ — Contact Us"),
  label: L("Contact Us"),
  variant: L("Red"),
  size: L("Medium"),
  linkBehavior: L("External"),
  externalLink: L("tel:+94772403117"),
  newTab: L(false),
  showArrow: L(false),
});

const faqItem = (id, question, answer) =>
  upsertEntry("accordionItem", id, {
    internalName: L(`FAQ — ${question}`),
    question: L(question),
    answer: L(rtDoc(rtP(answer))),
  });

await faqItem(
  "faq-hours",
  "What are your gym operating hours?",
  "We're open on weekdays from 5:30 AM to 11:00 PM. Public holidays may have adjusted hours follow our socials for updates."
);
await faqItem(
  "faq-experience",
  "Do I need prior experience to join?",
  "All experience levels are welcomed at Dynamic Fitness from complete beginners to advanced athletes. Our trainers will guide you through proper form, technique, and a personalised routine from day one."
);
await faqItem(
  "faq-pt",
  "Are personal training sessions included?",
  "All memberships include an initial assessment and orientation session. Dedicated personal training packages can be added to any plan at a discounted member rate."
);
await faqItem(
  "faq-fitconnect",
  "What is the FitConnect app?",
  "FitConnect is our member companion app where you can track workouts, book HIIT classes, view your nutrition plan, and monitor your progress all in one place."
);
await faqItem(
  "faq-cancel",
  "Can I freeze or cancel my membership?",
  "You can cancel your membership anytime. However, please note that we have a no refund policy for any membership plan."
);
await faqItem(
  "faq-discounts",
  "Do you offer couple or group discounts?",
  "We offer couple plans that save you up to 15%. For corporate or group enquiries of 5+, contact us directly for a custom package."
);

await upsertEntry("accordion", "accordion-faq", {
  internalName: L("Home FAQ"),
  frontEndComponent: L("Accordion - FAQ"),
  sectionNumber: L("04"),
  sectionLabel: L("FAQs"),
  headline: L("Frequently Asked Questions"),
  description: L(
    rtDoc(
      rtP(
        "Still have questions? We're here to help. Get in touch and our team will guide you through everything you need to know."
      )
    )
  ),
  cta: L(entryLink("cta-contact-us")),
  items: L([
    entryLink("faq-hours"),
    entryLink("faq-experience"),
    entryLink("faq-pt"),
    entryLink("faq-fitconnect"),
    entryLink("faq-cancel"),
    entryLink("faq-discounts"),
  ]),
});

// --- Banner (closing CTA) section ---
await upsertAsset("asset-cta-bg", {
  title: "Dynamic Fitness CTA background",
  fileName: "render.webp",
  contentType: "image/webp",
  filePath: `${OLD_PUBLIC}/render.webp`,
});
await upsertEntry("image", "img-cta-bg", {
  title: L("CTA Background"),
  altText: L(""),
  desktop: L(assetLink("asset-cta-bg")),
});

await upsertEntry("banner", "banner-cta", {
  internalName: L("Home Closing CTA"),
  frontEndComponent: L("Banner - CTA"),
  headline: L("Ready to start your"),
  highlightWord: L("transformation"),
  description: L(
    rtDoc(
      rtP(
        "Join hundreds of fitness enthusiasts currently training at Dynamic Fitness to achieve their goals and unlock their full potential."
      )
    )
  ),
  // Reuses the same "Book a Free Consultation" CTA as the Hero.
  cta: L(entryLink("cta-sample")),
  backgroundImage: L(entryLink("img-cta-bg")),
});

// --- "Your First 30 Days" steps (Accordion - Steps), shown under Pricing ---
// Step media — upload the supplied files, then create Image / Video entries.
const DOWNLOADS = "/Users/e25test/Downloads";
await upsertAsset("asset-step-consultation-webp", {
  title: "Free consultation",
  fileName: "free-consultation.webp",
  contentType: "image/webp",
  filePath: `${DOWNLOADS}/free-consultation.webp`,
});
await upsertAsset("asset-step-progress", {
  title: "Track your progress",
  fileName: "track-progress.webp",
  contentType: "image/webp",
  filePath: `${DOWNLOADS}/image.webp`,
});
await upsertAsset("asset-step-plan", {
  title: "Personal training",
  fileName: "personal-training.mp4",
  contentType: "video/mp4",
  filePath: `${DOWNLOADS}/WhatsApp Video 2026-06-02 at 17.32.22.mp4`,
});
await upsertAsset("asset-step-support", {
  title: "Coach-led support",
  fileName: "coach-led-support.mp4",
  contentType: "video/mp4",
  filePath: `${DOWNLOADS}/WhatsApp Video 2026-06-02 at 17.32.19.mp4`,
});

await upsertEntry("image", "img-step-consultation", {
  title: L("Free Consultation"),
  altText: L("A free consultation at Dynamic Fitness"),
  desktop: L(assetLink("asset-step-consultation-webp")),
});
await upsertEntry("image", "img-step-progress", {
  title: L("Track Your Progress"),
  altText: L("Tracking progress at Dynamic Fitness"),
  desktop: L(assetLink("asset-step-progress")),
});

// Photos for the Personal Training Plan + Coach-Led Support steps.
await upsertAsset("asset-step-plan-webp", {
  title: "Personal training plan",
  fileName: "personal-training-plan.webp",
  contentType: "image/webp",
  filePath: `${DOWNLOADS}/personal-training-plan.webp`,
});
await upsertAsset("asset-step-support-webp", {
  title: "Coach-led support",
  fileName: "coach-led-support.webp",
  contentType: "image/webp",
  filePath: `${DOWNLOADS}/coach-led-support.webp`,
});
await upsertEntry("image", "img-step-plan", {
  title: L("Personal Training Plan"),
  altText: L("A personal training plan session at Dynamic Fitness"),
  desktop: L(assetLink("asset-step-plan-webp")),
});
await upsertEntry("image", "img-step-support", {
  title: L("Coach-Led Support"),
  altText: L("Coach-led training support at Dynamic Fitness"),
  desktop: L(assetLink("asset-step-support-webp")),
});

const selfHostedVideo = (id, title, assetId) =>
  upsertEntry("video", id, {
    title: L(title),
    altText: L(title),
    videoType: L("Self Hosted"),
    selfHostedSource: L(assetLink(assetId)),
    autoplay: L(true),
    loop: L(true),
    muted: L(true),
    controls: L(false),
  });

await selfHostedVideo("vid-step-plan", "Personal Training", "asset-step-plan");
await selfHostedVideo("vid-step-support", "Coach-Led Support", "asset-step-support");

const stepItem = (id, title, desc, media) =>
  upsertEntry("accordionItem", id, {
    internalName: L(`Step — ${title}`),
    question: L(title),
    answer: L(rtDoc(rtP(desc))),
    ...(media.imageId ? { image: L(entryLink(media.imageId)) } : {}),
    ...(media.videoId ? { video: L(entryLink(media.videoId)) } : {}),
    cta: L(entryLink("cta-sample")),
  });

await stepItem(
  "step-consultation",
  "Free Consultation",
  "Tell us your goal, your routine, and where you are starting from. We'll help you choose the right path.",
  { imageId: "img-step-consultation" }
);
await stepItem(
  "step-plan",
  "Personal Training Plan",
  "Get a clear workout direction built around fat loss, strength, muscle gain, or overall fitness.",
  { imageId: "img-step-plan" }
);
await stepItem(
  "step-support",
  "Coach-Led Support",
  "Train with proper technique, structure, and accountability so every session moves you forward.",
  { imageId: "img-step-support" }
);
await stepItem(
  "step-progress",
  "Track Your Progress",
  "Use FitConnect and trainer check-ins to stay consistent, measure progress, and keep improving.",
  { imageId: "img-step-progress" }
);

await upsertEntry("accordion", "accordion-steps", {
  internalName: L("First 30 Days Steps"),
  frontEndComponent: L("Accordion - Steps"),
  sectionNumber: L("03"),
  sectionLabel: L("Your First 30 Days"),
  headline: L("Start Strong. Stay Guided."),
  description: L(
    rtDoc(
      rtP(
        "Most people do not fail because they lack motivation. They fail because they start without a plan."
      ),
      rtP(
        "At Dynamic Fitness, your journey begins with a free consultation where we understand your body, your goals, and your lifestyle. From there, our trainers help you train with purpose, build confidence, and see progress you can actually feel."
      )
    )
  ),
  cta: L(entryLink("cta-sample")),
  items: L([
    entryLink("step-consultation"),
    entryLink("step-plan"),
    entryLink("step-support"),
    entryLink("step-progress"),
  ]),
});

// --- Blog: author, posts, and the /blog listing page ---
await upsertEntry("author", "author-nadun", {
  internalName: L("Coach Nadun"),
  name: L("Coach Nadun"),
  role: L("Head Trainer"),
  avatarUrl: L(
    "https://api.dicebear.com/9.x/notionists/svg?seed=Coach%20Nadun&backgroundColor=ededed&beardProbability=100"
  ),
});

const blogPost = (id, p) =>
  upsertEntry("blogPost", id, {
    internalName: L(p.title),
    title: L(p.title),
    slug: L(p.slug),
    excerpt: L(p.excerpt),
    category: L(p.category),
    publishedDate: L(p.date),
    coverImage: L(entryLink(p.coverId)),
    author: L(entryLink("author-nadun")),
    body: L(p.body),
  });

await blogPost("post-first-week", {
  title: "5 Tips for Your First Week at the Gym",
  slug: "first-week-at-the-gym",
  excerpt:
    "Just getting started? These five simple habits set you up for steady, lasting progress.",
  category: "Training",
  date: "2026-05-22",
  coverId: "img-about-1",
  body: rtDoc(
    rtP(
      "Walking into a gym for the first time can feel intimidating — but it doesn't have to be. Here are five tips to make your first week count."
    ),
    rtH(2, "Start with a plan"),
    rtP(
      "Book a free consultation so a trainer can build a routine around your goals. A clear plan beats wandering between machines."
    ),
    rtH(2, "Focus on form"),
    rtP(
      "Master technique before adding weight. Good form prevents injury and builds the right habits from day one."
    ),
    rtH(2, "Be consistent"),
    rtP(
      "Three focused sessions a week beat one exhausting workout. Consistency is what creates real, lasting results."
    )
  ),
});

await blogPost("post-nutrition", {
  title: "Nutrition Basics for Building Muscle",
  slug: "nutrition-basics-for-building-muscle",
  excerpt:
    "Training is only half the equation. Here's how to fuel your body to actually see gains.",
  category: "Nutrition",
  date: "2026-05-12",
  coverId: "img-about-2",
  body: rtDoc(
    rtP(
      "You can't out-train a poor diet. If you want to build muscle, what you eat matters just as much as how you lift."
    ),
    rtH(2, "Prioritise protein"),
    rtP(
      "Aim for a steady intake of quality protein across the day to support recovery and growth."
    ),
    rtH(2, "Don't fear carbs"),
    rtP(
      "Carbohydrates fuel your workouts. Time them around training to train harder and recover faster."
    )
  ),
});

await blogPost("post-progress", {
  title: "How to Track Progress That Actually Matters",
  slug: "track-progress-that-matters",
  excerpt:
    "The scale isn't the whole story. Here are better ways to measure your fitness journey.",
  category: "Coaching",
  date: "2026-04-30",
  coverId: "img-about-3",
  body: rtDoc(
    rtP(
      "Progress isn't just a number on a scale. Tracking the right things keeps you motivated and moving forward."
    ),
    rtH(2, "Measure strength over time"),
    rtP(
      "Logging your lifts shows clear, motivating progress — even on weeks the scale doesn't move."
    ),
    rtH(2, "Use FitConnect"),
    rtP(
      "Our companion app and trainer check-ins help you stay consistent and see how far you've come."
    )
  ),
});

await upsertEntry("blogListing", "blog-listing-home", {
  internalName: L("Blog Listing"),
  frontEndComponent: L("Blog Listing - Default"),
  heading: L("The Dynamic Fitness Blog"),
  description: L(
    rtDoc(rtP("Training tips, nutrition guidance, and stories from the gym floor."))
  ),
});

await upsertEntry("seo", "seo-blog", {
  seoTitle: L("Blog — Dynamic Fitness"),
  seoDescription: L(
    "Training tips, nutrition guidance, and stories from the Dynamic Fitness team."
  ),
});

await upsertEntry("flexiblePage", "blog", {
  slug: L("/blog"),
  pageTitle: L("Blog"),
  seo: L(entryLink("seo-blog")),
  sections: L([entryLink("blog-listing-home")]),
});

await upsertEntry("flexiblePage", "home", {
  slug: L("/"),
  pageTitle: L("Home"),
  seo: L(entryLink("seo-home")),
  sections: L([
    entryLink("hero-home"),
    entryLink("info-about"),
    entryLink("info-pricing"),
    entryLink("accordion-steps"),
    entryLink("testimonial-home"),
    entryLink("accordion-faq"),
    entryLink("banner-cta"),
  ]),
});

// --- Cookie Policy page (Info - Default, rich text body) ---

const cookiePolicyBody = rtDoc(
  rtP(
    "This Cookie Policy explains how Dynamic Fitness uses cookies on this website and the choices you have."
  ),
  rtH(2, "What are cookies?"),
  rtP(
    "Cookies are small text files that a website stores in your browser. They let the site remember information about your visit, such as your preferences."
  ),
  rtH(2, "Functional cookies we use"),
  rtUl([
    "Consent preference (df_cookie_consent) — remembers whether you accepted or rejected cookies, so we don't ask you again on every visit.",
    "Pricing view (df_pricing_view) — remembers whether you last viewed Individual or Couple membership pricing.",
  ]),
  rtP(
    "These are functional cookies that help the site work the way you expect. We do not currently use cookies for advertising."
  ),
  rtH(2, "Security & anti-spam (Cloudflare Turnstile)"),
  rtP(
    "Our forms — such as the careers application — are protected by Cloudflare Turnstile, which helps us tell real visitors apart from automated bots without intrusive puzzles."
  ),
  rtP(
    "To do this, Turnstile may set a cookie and read limited technical signals from your browser (for example, a security token) when you interact with a form. This is used only to protect our forms from spam and abuse, and is processed by Cloudflare on our behalf. You can learn more in Cloudflare's privacy documentation."
  ),
  rtH(2, "Analytics"),
  rtP(
    "If we add analytics in the future to understand how visitors use the site, those cookies will only load after you accept cookies. You can change your choice at any time by clearing this site's cookies in your browser."
  ),
  rtH(2, "Managing cookies"),
  rtP(
    "You can delete or block cookies through your browser settings. Please note that blocking some cookies may affect how parts of the site work, including form protection."
  ),
  rtH(2, "Contact"),
  rtPara(
    rtText("If you have any questions about this policy, please get in touch with the "),
    teamLink,
    rtText(".")
  ),
  rtP("Last updated: June 2026.")
);

await upsertEntry("info", "info-cookie-policy", {
  internalName: L("Cookie Policy"),
  frontEndComponent: L("Info - Default"),
  headline: L("Cookie Policy"),
  body: L(cookiePolicyBody),
});

await upsertEntry("seo", "seo-cookie-policy", {
  seoTitle: L("Cookie Policy — Dynamic Fitness"),
  seoDescription: L(
    "How Dynamic Fitness uses cookies on this website and the choices available to you."
  ),
});
await upsertEntry("flexiblePage", "cookie-policy", {
  slug: L("/cookie-policy"),
  pageTitle: L("Cookie Policy"),
  seo: L(entryLink("seo-cookie-policy")),
  sections: L([entryLink("info-cookie-policy")]),
});

// --- Privacy Policy page ---
const privacyPolicyBody = rtDoc(
  rtP(
    "This Privacy Policy explains what information Dynamic Fitness collects through this website, how we use it, and the choices you have. By using this site you agree to this policy."
  ),
  rtH(2, "Information you give us"),
  rtP(
    "When you submit the careers application form, you provide your name, email address, phone number, the position you're interested in, any message you write, and your CV/resume file. If you contact us by other means, we receive whatever details you choose to share."
  ),
  rtH(2, "Information collected automatically"),
  rtUl([
    "Preference cookies that remember your cookie choice and your pricing view (see our Cookie Policy).",
    "Limited technical signals collected by Cloudflare Turnstile to protect our forms from bots and spam.",
  ]),
  rtH(2, "How we use your information"),
  rtUl([
    "To review job applications and contact you about opportunities.",
    "To remember your preferences so the site works the way you expect.",
    "To keep our forms secure and free from spam and abuse.",
  ]),
  rtH(2, "How job applications are handled"),
  rtP(
    "Applications submitted through the careers form are delivered to us by email, with your CV included as an attachment. They are not stored in this website's content system. We keep application emails only for as long as needed for our recruitment process."
  ),
  rtH(2, "Third-party services we rely on"),
  rtUl([
    "Contentful — hosts the content shown on this website.",
    "Resend — delivers careers form submissions to us by email.",
    "Cloudflare Turnstile — protects our forms from automated abuse.",
  ]),
  rtP(
    "Each of these providers processes data according to its own privacy terms. We do not sell your personal information."
  ),
  rtH(2, "Your choices"),
  rtP(
    "You can reject non-essential cookies using the banner, and clear cookies through your browser at any time. To request access to, correction of, or deletion of information you've sent us, please contact us."
  ),
  rtH(2, "Contact"),
  rtPara(
    rtText("Questions about this policy? Get in touch with the "),
    teamLink,
    rtText(".")
  ),
  rtP("Last updated: June 2026.")
);

await upsertEntry("info", "info-privacy", {
  internalName: L("Privacy Policy"),
  frontEndComponent: L("Info - Default"),
  headline: L("Privacy Policy"),
  body: L(privacyPolicyBody),
});

await upsertEntry("seo", "seo-privacy", {
  seoTitle: L("Privacy Policy — Dynamic Fitness"),
  seoDescription: L(
    "How Dynamic Fitness collects, uses, and protects your personal information."
  ),
});
await upsertEntry("flexiblePage", "privacy-policy", {
  slug: L("/privacy-policy"),
  pageTitle: L("Privacy Policy"),
  seo: L(entryLink("seo-privacy")),
  sections: L([entryLink("info-privacy")]),
});

// --- Terms of Use page ---
const termsBody = rtDoc(
  rtP(
    "These Terms of Use govern your use of the Dynamic Fitness website. By accessing or using this site, you agree to these terms. If you do not agree, please do not use the site."
  ),
  rtH(2, "Use of the site"),
  rtP(
    "You may use this website for lawful, personal, and informational purposes. You agree not to misuse the site, attempt to disrupt it, or submit false information through our forms."
  ),
  rtH(2, "Memberships and pricing"),
  rtP(
    "Membership details, prices, classes, and offers shown on this site are for general information and may change without notice. They do not form a binding offer. Please contact us to confirm current pricing and availability before making a decision."
  ),
  rtH(2, "Job applications"),
  rtP(
    "By submitting an application through the careers form, you confirm that the information and documents you provide are accurate and that you consent to us contacting you about your application."
  ),
  rtH(2, "Health disclaimer"),
  rtP(
    "Information on this site is general in nature and is not medical advice. Always consult a qualified healthcare professional before beginning any exercise or nutrition program."
  ),
  rtH(2, "Intellectual property"),
  rtP(
    "The content, branding, and design of this website belong to Dynamic Fitness unless stated otherwise, and may not be copied or reused without permission."
  ),
  rtH(2, "Third-party links"),
  rtP(
    "This site may link to external services and websites that we do not control. We are not responsible for their content or practices."
  ),
  rtH(2, "Limitation of liability"),
  rtP(
    "This website is provided on an 'as is' basis. To the extent permitted by law, Dynamic Fitness is not liable for any loss arising from your use of the site or reliance on its content."
  ),
  rtH(2, "Changes and governing law"),
  rtP(
    "We may update these terms from time to time. These terms are governed by the laws of Sri Lanka."
  ),
  rtH(2, "Contact"),
  rtPara(
    rtText("Questions about these terms? Get in touch with the "),
    teamLink,
    rtText(".")
  ),
  rtP("Last updated: June 2026.")
);

await upsertEntry("info", "info-terms", {
  internalName: L("Terms of Use"),
  frontEndComponent: L("Info - Default"),
  headline: L("Terms of Use"),
  body: L(termsBody),
});

await upsertEntry("seo", "seo-terms", {
  seoTitle: L("Terms of Use — Dynamic Fitness"),
  seoDescription: L(
    "The terms that govern your use of the Dynamic Fitness website."
  ),
});
await upsertEntry("flexiblePage", "terms", {
  slug: L("/terms"),
  pageTitle: L("Terms of Use"),
  seo: L(entryLink("seo-terms")),
  sections: L([entryLink("info-terms")]),
});

// --- Careers page (application form → email via Resend) ---
await upsertEntry("careersForm", "careers-form", {
  internalName: L("Careers Form"),
  frontEndComponent: L("Careers Form"),
  heading: L("Join the team"),
  description: L(
    rtDoc(
      rtP(
        "We're always looking for passionate trainers and staff to join Dynamic Fitness. Send us your details and CV — we'll be in touch."
      )
    )
  ),
  positions: L([
    "Personal Trainer",
    "Group Class Instructor",
    "Front Desk / Membership",
    "Nutrition Coach",
  ]),
  successMessage: L(
    "Thanks for applying! We've received your application and will be in touch soon."
  ),
});

// Careers page banner (Banner - CTA) shown above the form.
await upsertEntry("cta", "cta-careers-apply", {
  internalName: L("Careers — Apply Now"),
  label: L("Apply Now"),
  variant: L("Red"),
  size: L("Medium"),
  linkBehavior: L("External"),
  externalLink: L("#careers"),
  newTab: L(false),
  showArrow: L(true),
});
await upsertEntry("banner", "banner-careers", {
  internalName: L("Careers Banner"),
  frontEndComponent: L("Banner - CTA"),
  headline: L("Build your career with"),
  highlightWord: L("Dynamic Fitness"),
  description: L(
    rtDoc(
      rtP(
        "Join a team that's redefining fitness in Nawinna. We're always on the lookout for passionate trainers and staff."
      )
    )
  ),
  cta: L(entryLink("cta-careers-apply")),
  backgroundImage: L(entryLink("img-cta-bg")),
});

await upsertEntry("seo", "seo-careers", {
  seoTitle: L("Careers at Dynamic Fitness — Join Our Team in Nawinna"),
  seoDescription: L(
    "Build your career at Dynamic Fitness in Nawinna, Maharagama. Apply for personal trainer, coaching, and front-desk roles and grow with Sri Lanka's premier gym."
  ),
  seoCanonicalUrl: L("https://dynamicfitness.lk/careers"),
  seoOgImage: L(assetLink("asset-about-main")),
});
await upsertEntry("flexiblePage", "careers", {
  slug: L("/careers"),
  pageTitle: L("Careers"),
  seo: L(entryLink("seo-careers")),
  sections: L([entryLink("banner-careers"), entryLink("careers-form")]),
});

console.log(
  "\nDone. Space now has Seo, FlexiblePage, Cta, Image, Video, Hero, Info content types,"
);
console.log("sample entries, uploaded About gallery assets, a home page, and a");
console.log("/cookie-policy page. Run `npm run dev`.");
