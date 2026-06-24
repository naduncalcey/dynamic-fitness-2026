#!/usr/bin/env node
/*
 * Targeted migration — upsert + publish only the new `chat.*` UI labels for the
 * AI chat assistant widget. Use this on a space that's already been seeded so
 * you don't have to re-run the full scripts/seed-i18n.mjs. Idempotent.
 *
 * si-LK values are AI machine drafts — review per SINHALA-TRANSLATIONS.md.
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
const DEFAULT = "en-US";
const SI = "si-LK";
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

// Keep in sync with the `chat.*` block in scripts/seed-i18n.mjs.
const LABELS = [
  ["chat.launch", "chat", "Chat with Sajani", "සජනී සමඟ කතා කරන්න"],
  ["chat.title", "chat", "Sajani · Dynamic Fitness", "සජනී · ඩයිනමික් ෆිට්නස්"],
  ["chat.close", "chat", "Close chat", "කතාබහ වසන්න"],
  ["chat.greeting", "chat", "Hey there! 👋 I'm Sajani, your Dynamic Fitness buddy. Ask me about memberships, hours, classes, facilities — let's get you moving! 💪", "ආයුබෝවන්! 👋 මම සජනී, ඔබේ ඩයිනමික් ෆිට්නස් සහායිකාව. සාමාජිකත්වය, වේලාවන්, පන්ති, පහසුකම් ගැන අසන්න — අපි පටන් ගමු! 💪"],
  ["chat.placeholder", "chat", "Ask Sajani about memberships, hours, classes…", "සජනීගෙන් සාමාජිකත්වය, වේලාවන්, පන්ති ගැන අසන්න…"],
  ["chat.send", "chat", "Send", "යවන්න"],
  ["chat.typing", "chat", "Sajani is typing", "සජනී ටයිප් කරමින් සිටී"],
  ["chat.error", "chat", "Something went wrong. Please try again or contact us.", "යම් දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න හෝ අප හා සම්බන්ධ වන්න."],
  ["chat.retry", "chat", "Retry", "නැවත උත්සාහ කරන්න"],
  ["chat.disclaimer", "chat", "AI assistant — please confirm important details with the gym.", "AI සහයක — වැදගත් තොරතුරු ව්‍යායාම්ශාලාව සමඟ තහවුරු කර ගන්න."],
  ["chat.suggest.pricing", "chat", "What are your membership prices?", "ඔබගේ සාමාජික මිල ගණන් මොනවාද?"],
  ["chat.suggest.hours", "chat", "What are your opening hours?", "ඔබගේ විවෘත වේලාවන් මොනවාද?"],
  ["chat.suggest.classes", "chat", "What classes do you offer?", "ඔබ පිරිනමන පන්ති මොනවාද?"],
  ["chat.suggest.location", "chat", "Where are you located?", "ඔබ පිහිටා ඇත්තේ කොහේද?"],
];

const entryId = (key) => `uilabel-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

const upsertEntry = async (id, fields) => {
  let version;
  try {
    version = (await api(`/entries/${id}`)).sys.version;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  const result = await api(`/entries/${id}`, {
    method: "PUT",
    headers: {
      "X-Contentful-Content-Type": "uiLabel",
      ...(version ? { "X-Contentful-Version": String(version) } : {}),
    },
    body: JSON.stringify({ fields }),
  });
  await api(`/entries/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(result.sys.version) },
  });
};

console.log(`Upserting ${LABELS.length} chat.* UI labels…`);
for (const [key, group, en, si] of LABELS) {
  await upsertEntry(entryId(key), {
    key: { [DEFAULT]: key },
    group: { [DEFAULT]: group },
    value: { [DEFAULT]: en, [SI]: si },
  });
  console.log(`  ✓ ${key}`);
}
console.log("\n✅ chat.* labels added and published.");
