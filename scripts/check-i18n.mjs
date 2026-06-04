#!/usr/bin/env node
/* READ-ONLY: query uiLabel via the delivery GraphQL API in both locales. */
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
const TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const HOST = process.env.CONTENTFUL_GRAPHQL_HOST || "graphql.contentful.com";
const endpoint = `https://${HOST}/content/v1/spaces/${SPACE}/environments/${ENV}`;

const q = async (locale) => {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($locale: String){ uiLabelCollection(locale:$locale, limit:100){ items{ key value } } }`,
      variables: { locale },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return Object.fromEntries(json.data.uiLabelCollection.items.map((i) => [i.key, i.value]));
};

const en = await q("en-US");
const si = await q("si-LK");
console.log(`uiLabel count: en-US=${Object.keys(en).length}  si-LK=${Object.keys(si).length}\n`);
for (const key of ["nav.about", "footer.cta.text", "cookie.accept", "blog.noMatch", "pricing.couple"]) {
  console.log(`${key}\n  en: ${en[key]}\n  si: ${si[key]}`);
}
