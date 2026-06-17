#!/usr/bin/env node
/*
 * Adds an "Info - Default" section with the gym's contact details to the top of
 * the /contact FlexiblePage (above the contact form).
 *
 * Idempotent: re-running updates the same entry ("info-contact-details") in
 * place and won't duplicate the link on the contact page.
 *
 * Env (read from .env.local next to package.json):
 *   CONTENTFUL_SPACE_ID            required
 *   CONTENTFUL_MANAGEMENT_TOKEN    required — CMA token (CFPAT-…)
 *   CONTENTFUL_ENVIRONMENT         optional, defaults to "master"
 *
 * Usage:  node scripts/add-contact-info.mjs
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
  console.error("✗ CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN are required in .env.local.");
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

const locales = await api("/locales");
const defaultLocale =
  locales.items.find((l) => l.default)?.code || locales.items[0]?.code || "en-US";
const L = (v) => ({ [defaultLocale]: v });
const entryLink = (id) => ({ sys: { type: "Link", linkType: "Entry", id } });

// --- Rich Text builders (Contentful rich text JSON) ---
const rtText = (value, marks = []) => ({ nodeType: "text", value, marks, data: {} });
const rtBold = (value) => rtText(value, [{ type: "bold" }]);
const rtP = (value) => ({ nodeType: "paragraph", data: {}, content: [rtText(value)] });
const rtPara = (...content) => ({ nodeType: "paragraph", data: {}, content });
const rtH = (level, value) => ({ nodeType: `heading-${level}`, data: {}, content: [rtText(value)] });
const rtHr = () => ({ nodeType: "hr", data: {}, content: [] });
const rtLink = (uri, value) => ({
  nodeType: "hyperlink",
  data: { uri },
  content: [rtText(value)],
});
const rtDoc = (...content) => ({ nodeType: "document", data: {}, content });

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

// --- 1. Create the contact-details Info section ---
// The title is an <h2> in the body (not the `headline` field, which renders an
// <h1> — the form already has the page's single <h1>). Entity names are bold
// paragraphs, phones are tel: links, and an <hr> separates the two contacts.
const TITLE = "Contact Details";
const ADDRESS = "14 Sri Devananda Road, Nawinna, Maharagama";
const contactBody = rtDoc(
  rtH(2, TITLE),
  rtPara(rtBold("Dynamic Fitness (Pvt) Ltd")),
  rtP(ADDRESS),
  rtPara(rtLink("tel:+94772403117", "+94 77 240 3117")),
  rtHr(),
  rtPara(rtBold("Nadun Nissanka"), rtText(" — Founder")),
  rtP(ADDRESS),
  rtPara(rtLink("tel:+94703026000", "+94 70 302 6000"))
);

await upsertEntry("info", "info-contact-details", {
  internalName: L("Contact — Details"),
  frontEndComponent: L("Info - Default"),
  body: L(contactBody),
});

// --- 2. Find the /contact FlexiblePage and prepend the section ---
const NEW_SECTION_ID = "info-contact-details";

const found = await api(
  `/entries?content_type=flexiblePage&fields.slug=${encodeURIComponent("/contact")}&limit=1`
);
const contactPage = found.items?.[0];
if (!contactPage) {
  console.error('✗ No FlexiblePage with slug "/contact" found. Nothing to link.');
  process.exit(1);
}
const contactId = contactPage.sys.id;
console.log(`• contact page entry: "${contactId}"`);

// Append the link to the END of every locale's sections array (so it renders
// below the contact form). Idempotent: drop any existing occurrence first, then
// append, so re-runs also move a previously-prepended link to the bottom.
const fields = contactPage.fields;
const sectionsByLocale = fields.sections ?? { [defaultLocale]: [] };
let changed = false;
for (const [loc, arr] of Object.entries(sectionsByLocale)) {
  const list = (Array.isArray(arr) ? arr : []).filter((l) => l?.sys?.id !== NEW_SECTION_ID);
  const next = [...list, entryLink(NEW_SECTION_ID)];
  const sameOrder =
    Array.isArray(arr) &&
    arr.length === next.length &&
    arr.every((l, i) => l?.sys?.id === next[i].sys.id);
  if (sameOrder) {
    console.log(`  · "${loc}" already ends with the section → leaving as-is`);
    continue;
  }
  sectionsByLocale[loc] = next;
  changed = true;
}
fields.sections = sectionsByLocale;

if (changed) {
  const updated = await api(`/entries/${contactId}`, {
    method: "PUT",
    headers: {
      "X-Contentful-Content-Type": "flexiblePage",
      "X-Contentful-Version": String(contactPage.sys.version),
    },
    body: JSON.stringify({ fields }),
  });
  await api(`/entries/${contactId}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(updated.sys.version) },
  });
  console.log(`  ✓ moved section below the form + republished contact page`);
} else {
  console.log("  ✓ contact page already up to date");
}

console.log("\nDone. The contact page now leads with the contact-details section.");
