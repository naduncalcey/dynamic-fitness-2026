#!/usr/bin/env node
/*
 * i18n seed — Phase 1.
 *
 *   1. Ensures the Sinhala locale (si-LK, fallback en-US) exists.
 *   2. Creates/updates the `uiLabel` content type (key + localized value).
 *   3. Upserts + publishes one entry per hardcoded UI string, with en-US and a
 *      si-LK MACHINE-DRAFT value (flagged for native review).
 *
 * Idempotent and re-runnable. Mirrors scripts/seed-contentful.mjs conventions.
 * Env: CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT?
 *
 * ⚠ The si-LK strings below are AI drafts. See SINHALA-TRANSLATIONS.md — a native
 *   speaker should review the `value` field (si-LK) of these entries in Contentful.
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

const DEFAULT = "en-US";
const SI = "si-LK";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Locale
// ─────────────────────────────────────────────────────────────────────────────
const locales = await api("/locales");
if (locales.items.some((l) => l.code === SI)) {
  console.log(`• locale ${SI} already exists → skip`);
} else {
  await api("/locales", {
    method: "POST",
    body: JSON.stringify({ name: "Sinhala (Sri Lanka)", code: SI, fallbackCode: DEFAULT }),
  });
  console.log(`  ✓ created locale ${SI} (fallback ${DEFAULT})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. uiLabel content type
// ─────────────────────────────────────────────────────────────────────────────
const UI_LABEL_TYPE = {
  name: "UI Label",
  description:
    "A single interface string (button/nav/form label). `value` is localized — edit per language. AI-drafted Sinhala; review before launch.",
  displayField: "key",
  fields: [
    { id: "key", name: "Key", type: "Symbol", required: true, validations: [{ unique: true }] },
    { id: "value", name: "Value", type: "Symbol", required: true, localized: true },
    { id: "group", name: "Group", type: "Symbol" },
    { id: "note", name: "Note (editor context)", type: "Symbol" },
  ],
};

const publishContentType = (id, version) =>
  api(`/content_types/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(version) },
  });

const upsertContentType = async (id, spec) => {
  let version;
  try {
    version = (await api(`/content_types/${id}`)).sys.version;
    console.log(`• content type "${id}" exists (v${version}) → updating`);
  } catch (e) {
    if (e.status !== 404) throw e;
    console.log(`• content type "${id}" → creating`);
  }
  const result = await api(`/content_types/${id}`, {
    method: "PUT",
    headers: version ? { "X-Contentful-Version": String(version) } : {},
    body: JSON.stringify(spec),
  });
  await publishContentType(id, result.sys.version);
  console.log(`  ✓ published content type "${id}"`);
};

await upsertContentType("uiLabel", UI_LABEL_TYPE);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Label entries — { key, group, en, si }
//    si-LK values are AI machine drafts (review per SINHALA-TRANSLATIONS.md).
//    {q} is a runtime placeholder substituted in code (keeps SI word order).
// ─────────────────────────────────────────────────────────────────────────────
const LABELS = [
  // Header
  ["nav.about", "header", "About", "අප ගැන"],
  ["nav.pricing", "header", "Pricing", "මිල ගණන්"],
  ["nav.blog", "header", "Blog", "බ්ලොගය"],
  ["nav.careers", "header", "Careers", "රැකියා අවස්ථා"],
  ["header.toggleMenu", "header", "Toggle menu", "මෙනුව විවෘත/වසන්න"],
  ["header.changeLanguage", "header", "Change language", "භාෂාව වෙනස් කරන්න"],

  // Footer
  ["footer.tagline", "footer", "Nawinna's premier fitness destination.", "නාවින්නේ අංක එකේ ශාරීරික යෝග්‍යතා මධ්‍යස්ථානය."],
  ["footer.group.services", "footer", "Services", "සේවාවන්"],
  ["footer.group.resources", "footer", "Resources", "සම්පත්"],
  ["footer.group.company", "footer", "Company", "සමාගම"],
  ["footer.link.personalTraining", "footer", "Personal Training", "පුද්ගලික පුහුණුව"],
  ["footer.link.hiitClasses", "footer", "HIIT Classes", "HIIT පන්ති"],
  ["footer.link.pricing", "footer", "Pricing", "මිල ගණන්"],
  ["footer.link.fitconnect", "footer", "FitConnect App", "FitConnect යෙදුම"],
  ["footer.link.classSchedule", "footer", "Class Schedule", "පන්ති කාලසටහන"],
  ["footer.link.faqs", "footer", "FAQs", "නිතර අසන පැන"],
  ["footer.link.about", "footer", "About Us", "අප ගැන"],
  ["footer.link.careers", "footer", "Careers", "රැකියා අවස්ථා"],
  ["footer.link.blog", "footer", "Blog", "බ්ලොගය"],
  ["footer.link.contact", "footer", "Contact", "සම්බන්ධ වන්න"],
  ["footer.cta.prefix", "footer", "START NOW //", "දැන්ම ආරම්භ කරන්න //"],
  ["footer.cta.text", "footer", "Book a Free Consultation", "නොමිලේ උපදේශනයක් වෙන්කරවා ගන්න"],
  ["footer.hours", "footer", "Open 5.30 AM – 11.00 PM (Weekdays + Saturday) / 6.00 AM – 11.30 AM (Sunday)", "විවෘතයි: පෙ.ව. 5.30 – ප.ව. 11.00 (සතියේ දිනවල + සෙනසුරාදා) / පෙ.ව. 6.00 – පෙ.ව. 11.30 (ඉරිදා)"],
  ["footer.legal.privacy", "footer", "Privacy", "පෞද්ගලිකත්වය"],
  ["footer.legal.terms", "footer", "Terms", "කොන්දේසි"],
  ["footer.legal.cookies", "footer", "Cookie Policy", "කුකී ප්‍රතිපත්තිය"],

  // Cookie banner
  ["cookie.message", "cookie", "We use cookies to improve your experience and analyze site traffic. You can accept or reject non-essential cookies.", "ඔබගේ අත්දැකීම වැඩිදියුණු කිරීමටත්, වෙබ් අඩවියේ ගමනාගමනය විශ්ලේෂණය කිරීමටත් අපි කුකීස් භාවිතා කරමු. අත්‍යවශ්‍ය නොවන කුකීස් පිළිගැනීමට හෝ ප්‍රතික්ෂේප කිරීමට ඔබට හැකිය."],
  ["cookie.learnMore", "cookie", "Learn more", "තවත් දැනගන්න"],
  ["cookie.reject", "cookie", "Reject", "ප්‍රතික්ෂේප කරන්න"],
  ["cookie.accept", "cookie", "Accept", "පිළිගන්න"],
  ["cookie.ariaLabel", "cookie", "Cookie consent", "කුකී කැමැත්ත"],

  // Careers form (labels stored without the required "*", which code appends)
  ["careers.fullName", "careers", "Full Name", "සම්පූර්ණ නම"],
  ["careers.fullNamePlaceholder", "careers", "Jane Doe", "උදා: කමල් පෙරේරා"],
  ["careers.email", "careers", "Email", "විද්‍යුත් තැපෑල"],
  ["careers.phone", "careers", "Phone", "දුරකථනය"],
  ["careers.position", "careers", "Position", "තනතුර"],
  ["careers.selectPosition", "careers", "Select a position", "තනතුරක් තෝරන්න"],
  ["careers.generalApplication", "careers", "General Application", "සාමාන්‍ය අයදුම්පත"],
  ["careers.message", "careers", "Message", "පණිවිඩය"],
  ["careers.messagePlaceholder", "careers", "Tell us about yourself", "ඔබ ගැන අපට කියන්න"],
  ["careers.cv", "careers", "CV / Resume (PDF or Word, max 5 MB)", "ජීව දත්ත පත්‍රය / CV (PDF හෝ Word, උපරිම 5 MB)"],
  ["careers.sending", "careers", "Sending…", "යවමින්…"],
  ["careers.submit", "careers", "Submit Application", "අයදුම්පත යවන්න"],
  ["careers.success", "careers", "Thanks! Your application has been sent.", "ස්තූතියි! ඔබගේ අයදුම්පත සාර්ථකව යවා ඇත."],
  ["careers.errorGeneric", "careers", "Something went wrong. Please try again.", "යම් දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න."],
  ["careers.errorNetwork", "careers", "Network error. Please try again.", "ජාල දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න."],

  // Blog
  ["blog.searchPlaceholder", "blog", "Search articles…", "ලිපි සොයන්න…"],
  ["blog.searchAria", "blog", "Search articles", "ලිපි සොයන්න"],
  ["blog.noPosts", "blog", "No posts yet. Check back soon.", "තවම ලිපි නැත. ඉක්මනින් නැවත පරීක්ෂා කරන්න."],
  ["blog.noMatch", "blog", "No articles match “{q}”.", "“{q}” සඳහා ගැළපෙන ලිපි නොමැත."],
  ["blog.backToBlog", "blog", "Back to blog", "බ්ලොගයට ආපසු"],

  // Pricing toggle
  ["pricing.individual", "pricing", "Individual", "තනි පුද්ගල"],
  ["pricing.couple", "pricing", "Couple", "යුවළ"],
  ["pricing.toggleAria", "pricing", "Toggle individual or couple pricing", "තනි හෝ යුවළ මිල ගණන් මාරු කරන්න"],

  // Testimonials carousel (aria labels)
  ["testimonials.label", "testimonials", "Customer testimonials", "පාරිභෝගික සාක්ෂි"],
  ["testimonials.choose", "testimonials", "Choose a testimonial to show", "පෙන්වීමට සාක්ෂියක් තෝරන්න"],
  ["testimonials.show", "testimonials", "Show testimonial {n}", "සාක්ෂිය {n} පෙන්වන්න"],
  ["testimonials.previous", "testimonials", "Previous testimonial", "පෙර සාක්ෂිය"],
  ["testimonials.next", "testimonials", "Next testimonial", "ඊළඟ සාක්ෂිය"],
];

const entryId = (key) => `uilabel-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

const upsertEntry = async (contentType, id, fields) => {
  let version;
  try {
    version = (await api(`/entries/${id}`)).sys.version;
  } catch (e) {
    if (e.status !== 404) throw e;
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
};

console.log(`\nSeeding ${LABELS.length} UI labels…`);
for (const [key, group, en, si] of LABELS) {
  await upsertEntry("uiLabel", entryId(key), {
    key: { [DEFAULT]: key },
    group: { [DEFAULT]: group },
    value: { [DEFAULT]: en, [SI]: si },
  });
  console.log(`  ✓ ${key}`);
}

console.log(`\n✅ Phase 1 done: locale ${SI} + uiLabel type + ${LABELS.length} labels.`);
