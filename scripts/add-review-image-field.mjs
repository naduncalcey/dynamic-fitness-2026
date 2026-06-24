#!/usr/bin/env node
/*
 * Targeted migration — add the optional `image` (Avatar Image) field to the
 * `review` content type and publish it. Non-destructive: it only appends the
 * field to the type, leaving all existing Review ENTRIES untouched (unlike the
 * full seed-contentful.mjs, which re-upserts sample entries).
 *
 * Idempotent: re-running is a no-op once the field exists.
 * Env: CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT?
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envFile = join(scriptDir, "..", ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
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
  return text ? JSON.parse(text) : {};
};

const IMAGE_FIELD = {
  id: "image",
  name: "Avatar Image",
  type: "Link",
  linkType: "Entry",
  validations: [{ linkContentType: ["image"] }],
};

const ct = await api(`/content_types/review`);
const fieldIds = ct.fields.map((f) => f.apiName ?? f.id);

if (fieldIds.includes("image")) {
  console.log("• review.image already exists → nothing to do");
  process.exit(0);
}

// Insert `image` right after `avatarUrl` (falls back to appending).
const at = fieldIds.indexOf("avatarUrl");
const fields = [...ct.fields];
fields.splice(at >= 0 ? at + 1 : fields.length, 0, IMAGE_FIELD);

console.log("• adding field review.image (Avatar Image → Image entry)…");
const updated = await api(`/content_types/review`, {
  method: "PUT",
  headers: { "X-Contentful-Version": String(ct.sys.version) },
  body: JSON.stringify({ name: ct.name, displayField: ct.displayField, description: ct.description, fields }),
});

await api(`/content_types/review/published`, {
  method: "PUT",
  headers: { "X-Contentful-Version": String(updated.sys.version) },
});

console.log("✅ review.image added and published.");
