#!/usr/bin/env node
/*
 * i18n — Phase 2a. Sets `localized: true` on the text-bearing display fields of
 * each content type and republishes the type. Non-destructive: existing en-US
 * values are untouched; fields simply gain per-locale capability so si-LK values
 * can be written (see write-sinhala.mjs).
 *
 * Structural fields (slug, internalName, frontEndComponent, links, booleans,
 * numbers, dates, urls) are deliberately NOT localized.
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
if (!SPACE || !CMA) {
  console.error("✗ Need CONTENTFUL_SPACE_ID + CONTENTFUL_MANAGEMENT_TOKEN in .env.local");
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

// contentType → field ids to make localized.
const LOCALIZE = {
  hero: ["eyebrow", "headline", "highlightText", "subheading"],
  info: ["body", "sectionLabel", "headline", "headlineFaded", "description", "imageTooltips", "coupleDiscountLabel"],
  pricingPlan: ["name", "description", "priceSuffix", "features", "ctaLabel"],
  accordion: ["sectionLabel", "headline", "description"],
  accordionItem: ["question", "answer"],
  banner: ["headline", "highlightWord", "description"],
  // author.role is localized for the "Banner / Team" cards (member NAMES stay
  // non-localized — proper nouns); also localizes blog author bylines.
  author: ["role"],
  review: ["quote", "timeAgo"],
  careersForm: ["heading", "description", "successMessage", "positions"],
  blogListing: ["heading", "description"],
  blogPost: ["title", "excerpt", "body"],
  seo: ["seoTitle", "seoDescription"],
  cta: ["label"],
  image: ["altText", "caption"],
  video: ["title", "altText"],
  flexiblePage: ["pageTitle"],
};

for (const [typeId, fieldIds] of Object.entries(LOCALIZE)) {
  const ct = await api(`/content_types/${typeId}`);
  const want = new Set(fieldIds);
  let changed = 0;
  for (const f of ct.fields) {
    if (want.has(f.id) && !f.localized) {
      f.localized = true;
      changed++;
    }
  }
  if (!changed) {
    console.log(`• ${typeId}: already localized → skip`);
    continue;
  }
  const updated = await api(`/content_types/${typeId}`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(ct.sys.version) },
    body: JSON.stringify({
      name: ct.name,
      description: ct.description,
      displayField: ct.displayField,
      fields: ct.fields,
    }),
  });
  await api(`/content_types/${typeId}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(updated.sys.version) },
  });
  console.log(`  ✓ ${typeId}: localized ${changed} field(s) → ${fieldIds.join(", ")}`);
}

console.log("\n✅ Phase 2a done: content fields are now localizable.");
