#!/usr/bin/env node
/*
 * i18n — Phase 2b. Writes si-LK MACHINE-DRAFT values onto existing entries,
 * preserving en-US, then republishes. RT(...) fields become a single-paragraph
 * rich-text document (faithful for the short prose we translate here).
 *
 * ⚠ AI drafts — native review required (see SINHALA-TRANSLATIONS.md). Deliberately
 *   NOT translated (fall back to English): legal page bodies (Terms/Privacy/Cookie),
 *   the two long blog article bodies, and verbatim customer reviews.
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

const SI = "si-LK";
const RT = (text) => ({ __rt: text });
const toRichText = (text) => ({
  nodeType: "document",
  data: {},
  content: [
    { nodeType: "paragraph", data: {}, content: [{ nodeType: "text", value: text, marks: [], data: {} }] },
  ],
});

// entryId → { fieldId: value }. value: string | string[] | RT(string).
const T = {
  // Hero (highlightText "Dynamic Fitness" is the brand → left English)
  "hero-home": { headline: "ඔබේ හැකියාව මුදා හරින්න" },

  // Info — pricing / about (legal bodies intentionally left English)
  "info-pricing": {
    sectionLabel: "සැලැස්ම තෝරන්න",
    headline: "ඔබේ සාමාජිකත්වය",
    headlineFaded: "තෝරාගන්න",
    coupleDiscountLabel: "15%ක් ඉතිරියි",
  },
  "info-about": {
    sectionLabel: "අති නවීන ශාරීරික යෝග්‍යතා මධ්‍යස්ථානය",
    headline: "සැකසුණේ",
    headlineFaded: "පරිවර්තනයන් සඳහා",
    description: RT(
      "නවෝත්පාදනය හා ආවේශය හමුවන Dynamic Fitness හිදී ඔබේ ව්‍යායාම පරිවර්තනය කර, ඔබේ සීමාවන් නැවත නිර්වචනය කරන්න. අදම ඔබේ යෝග්‍යතාව ඉහළ නංවා, dynamic වෙනස සොයාගන්න."
    ),
    imageTooltips: ["අපගේ පහසුකම", "ශක්ති කලාපය", "ශක්ති කලාපය", "කාඩියෝ ප්‍රදේශය"],
  },
  "info-terms": { headline: "භාවිත නියමයන්" },
  "info-privacy": { headline: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය" },
  "info-cookie-policy": { headline: "කුකී ප්‍රතිපත්තිය" },

  // Pricing plans
  "plan-monthly": {
    name: "මාසික",
    description: "ආරම්භකයින්ට සුදුසුම",
    priceSuffix: "/මසකට",
    features: ["සම්පූර්ණ ජිම් ප්‍රවේශය", "ලොකර් කාමරය සහ ෂවර්", "සතියකට නොමිලේ HIIT පන්ති 1ක්", "FitConnect ප්‍රවේශය"],
    ctaLabel: "ආරම්භ කරන්න",
  },
  "plan-3months": {
    name: "මාස 3",
    description: "බැරෑරුම් ක්‍රීඩකයින්ට",
    features: ["මාසික සැලැස්මේ සියල්ල", "අසීමිත HIIT පන්ති", "පෝෂණ මග පෙන්වීම"],
    ctaLabel: "ආරම්භ කරන්න",
  },
  "plan-6months": {
    name: "මාස 6",
    description: "උපරිම ප්‍රතිඵල, සීමා නැත",
    features: ["මාස 3 සැලැස්මේ සියල්ල", "අභිරුචි ආහාර සැලසුම්"],
    ctaLabel: "ආරම්භ කරන්න",
  },
  "plan-12months": {
    name: "මාස 12",
    description: "ජිම් ලෝලීන්ට",
    features: ["මාස 6 සැලැස්මේ සියල්ල"],
    ctaLabel: "ආරම්භ කරන්න",
  },
  "plan-couple-6": {
    name: "මාස 6 - යුවළ",
    description: "යුවළුන්ට හොඳම වටිනාකම",
    features: ["සම්පූර්ණ ජිම් ප්‍රවේශය", "ලොකර් කාමරය සහ ෂවර්", "සතියකට නොමිලේ HIIT පන්ති 1ක්", "FitConnect ප්‍රවේශය"],
    ctaLabel: "ආරම්භ කරන්න",
  },
  "plan-couple-12": {
    name: "මාස 12 - යුවළ",
    description: "යුවළ සඳහා පරම කැපවීම",
    features: ["මාස 6 සැලැස්මේ සියල්ල"],
    ctaLabel: "ආරම්භ කරන්න",
  },

  // Accordions
  "accordion-steps": {
    sectionLabel: "ඔබේ පළමු දින 30",
    headline: "ශක්තිමත්ව අරඹන්න. මග පෙන්වීම ලබන්න.",
    description: RT(
      "Dynamic Fitness හිදී ඔබේ ගමන ආරම්භ වන්නේ නොමිලේ උපදේශනයකින්. එහිදී අපි ඔබේ සිරුර, ඔබේ ඉලක්ක සහ ඔබේ ජීවන රටාව තේරුම් ගනිමු. එතැන් සිට, අරමුණක් ඇතිව පුහුණු වීමට, විශ්වාසය ගොඩනඟා ගැනීමට සහ ඔබට සැබැවින්ම දැනෙන ප්‍රගතියක් දැකීමට අපගේ පුහුණුකරුවන් ඔබට උදව් කරයි."
    ),
  },
  "accordion-faq": {
    sectionLabel: "නිතර අසන පැන",
    headline: "නිතර අසන ප්‍රශ්න",
    description: RT(
      "තවමත් ප්‍රශ්න තිබේද? අපි උදව් කිරීමට මෙහි සිටිමු. අප හා සම්බන්ධ වන්න, ඔබ දැනගත යුතු සියල්ල අපගේ කණ්ඩායම ඔබට පැහැදිලි කර දෙනු ඇත."
    ),
  },

  // Steps
  "step-consultation": {
    question: "නොමිලේ උපදේශනය",
    answer: RT(
      "ඔබේ ඉලක්කය, ඔබේ දිනචරියාව සහ ඔබ ආරම්භ කරන්නේ කොතැනින්ද යන්න අපට කියන්න. නිවැරදි මාර්ගය තෝරා ගැනීමට අපි ඔබට උදව් කරමු."
    ),
  },
  "step-plan": {
    question: "පුද්ගලික පුහුණු සැලැස්ම",
    answer: RT(
      "මේද අඩු කිරීම, ශක්තිය, මාංශ පේශි වර්ධනය හෝ සමස්ත යෝග්‍යතාව වටා ගොඩනඟන ලද පැහැදිලි ව්‍යායාම මාර්ගයක් ලබා ගන්න."
    ),
  },
  "step-support": {
    question: "පුහුණුකරු මෙහෙයවන සහාය",
    answer: RT(
      "සෑම සැසියක්ම ඔබව ඉදිරියට ගෙන යන පරිදි නිසි තාක්ෂණය, ව්‍යුහය සහ වගකීම සහිතව පුහුණු වන්න."
    ),
  },
  "step-progress": {
    question: "ඔබේ ප්‍රගතිය නිරීක්ෂණය කරන්න",
    answer: RT(
      "ස්ථාවරව සිටීමට, ප්‍රගතිය මැනීමට සහ දිගටම දියුණු වීමට FitConnect සහ පුහුණුකරු පරීක්ෂාවන් භාවිත කරන්න."
    ),
  },

  // FAQ
  "faq-experience": {
    question: "සම්බන්ධ වීමට පෙර අත්දැකීම් අවශ්‍යද?",
    answer: RT(
      "සම්පූර්ණ ආරම්භකයින්ගේ සිට දක්ෂ ක්‍රීඩකයින් දක්වා සියලුම මට්ටම්වල අය Dynamic Fitness හි පිළිගනිමු. පළමු දිනයේ සිටම නිසි ඉරියව්, තාක්ෂණය සහ පුද්ගලාරෝපිත දිනචරියාවක් හරහා අපගේ පුහුණුකරුවන් ඔබට මග පෙන්වයි."
    ),
  },
  "faq-pt": {
    question: "පුද්ගලික පුහුණු සැසි ඇතුළත්ද?",
    answer: RT(
      "සියලුම සාමාජිකත්වයන්හි ආරම්භක තක්සේරුවක් සහ දිශානති සැසියක් ඇතුළත් වේ. කැප වූ පුද්ගලික පුහුණු පැකේජ ඕනෑම සැලැස්මකට වට්ටම් සහිත සාමාජික මිලකට එක් කළ හැකිය."
    ),
  },
  "faq-fitconnect": {
    question: "FitConnect යෙදුම යනු කුමක්ද?",
    answer: RT(
      "FitConnect යනු අපගේ සාමාජික සහායක යෙදුමයි. ව්‍යායාම නිරීක්ෂණය, HIIT පන්ති වෙන්කරවා ගැනීම, ඔබේ පෝෂණ සැලැස්ම බැලීම සහ ඔබේ ප්‍රගතිය නිරීක්ෂණය — සියල්ල එකම තැනකින් කළ හැකිය."
    ),
  },
  "faq-cancel": {
    question: "මගේ සාමාජිකත්වය තාවකාලිකව නැවැත්වීම හෝ අවලංගු කළ හැකිද?",
    answer: RT(
      "ඔබට ඕනෑම වේලාවක ඔබේ සාමාජිකත්වය අවලංගු කළ හැකිය. කෙසේ වෙතත්, කිසිදු සාමාජිකත්ව සැලැස්මකට මුදල් ආපසු ගෙවීමේ ප්‍රතිපත්තියක් නොමැති බව සලකන්න."
    ),
  },
  "faq-discounts": {
    question: "ඔබ යුවළ හෝ කණ්ඩායම් වට්ටම් ලබා දෙනවාද?",
    answer: RT(
      "15%ක් දක්වා ඉතිරි කරගත හැකි යුවළ සැලසුම් අපි ලබා දෙමු. 5කට වැඩි ආයතනික හෝ කණ්ඩායම් විමසීම් සඳහා, අභිරුචි පැකේජයක් සඳහා අප හා කෙලින්ම සම්බන්ධ වන්න."
    ),
  },
  "faq-hours": {
    question: "ඔබේ ජිම් එකේ විවෘත වේලාවන් මොනවාද?",
    answer: RT(
      "අපි සතියේ දිනවල පෙ.ව. 5:30 සිට ප.ව. 11:00 දක්වා විවෘතව ඇත. රජයේ නිවාඩු දිනවල වේලාවන් වෙනස් විය හැක — යාවත්කාලීන සඳහා අපගේ සමාජ මාධ්‍ය අනුගමනය කරන්න."
    ),
  },

  // Banners (highlightWord "Dynamic Fitness" = brand → left English on careers)
  "banner-careers": {
    headline: "අප සමඟ ඔබේ වෘත්තිය ගොඩනඟන්න",
    description: RT(
      "නාවින්නේ යෝග්‍යතාව නැවත නිර්වචනය කරන කණ්ඩායමකට එක්වන්න. උද්‍යෝගිමත් පුහුණුකරුවන් සහ කාර්ය මණ්ඩලය සොයමින් අපි නිතරම සිටිමු."
    ),
  },
  "banner-cta": {
    headline: "ආරම්භ කිරීමට සූදානම්ද ඔබේ",
    highlightWord: "පරිවර්තනය",
    description: RT(
      "ඔවුන්ගේ ඉලක්ක සපුරා ගැනීමට සහ සම්පූර්ණ හැකියාව මුදා හැරීමට Dynamic Fitness හි දැනට පුහුණු වන යෝග්‍යතා ලෝලීන් සිය ගණනකට එක්වන්න."
    ),
  },
  // "Banner / Team" on /careers — heading renders "අපගේ කණ්ඩායම".
  "banner-team": {
    headline: "අපගේ",
    highlightWord: "කණ්ඩායම",
    description: RT(
      "Dynamic Fitness පිටුපස සිටින පුහුණුකරුවෝ සහ කාර්ය මණ්ඩලය — සෑම පියවරකදීම ඔබේ පුහුණුව, තාක්ෂණය සහ ප්‍රගතිය මෙහෙයවීමට අප මෙහි සිටිමු."
    ),
  },

  // Team-member roles (member names stay English — proper nouns).
  "7vVQLIHRlybXZaGB5OuxsS": { role: "ආරම්භකයා" },
  "author-coach-strength": { role: "සම-ආරම්භකයා / කළමනාකරු" },
  "author-coach-pt": { role: "සම-ආරම්භකයා / කළමනාකරු" },
  "author-coach-group": { role: "ජ්‍යෙෂ්ඨ පුහුණුකරු / බහුකාර්ය පුහුණුකරු" },

  // Careers form
  "careers-form": {
    heading: "කණ්ඩායමට එක්වන්න",
    description: RT(
      "Dynamic Fitness හා එක්වීමට උද්‍යෝගිමත් පුහුණුකරුවන් සහ කාර්ය මණ්ඩලය සොයමින් අපි නිතරම සිටිමු. ඔබේ විස්තර සහ CV එක අපට එවන්න — අපි ඔබ හා සම්බන්ධ වෙමු."
    ),
    successMessage: "අයදුම් කිරීම ගැන ස්තූතියි! ඔබේ අයදුම්පත අපට ලැබී ඇති අතර, ඉක්මනින් ඔබ හා සම්බන්ධ වෙමු.",
    positions: ["පුද්ගලික පුහුණුකරු", "කණ්ඩායම් පන්ති උපදේශක", "පිළිගැනීමේ මේසය / සාමාජිකත්වය", "පෝෂණ උපදේශක"],
  },

  // Blog listing
  "blog-listing-home": {
    heading: "Dynamic Fitness බ්ලොගය",
    description: RT("පුහුණු ඉඟි, පෝෂණ මග පෙන්වීම සහ ජිම් එකෙන් කතා."),
  },

  // Blog posts — titles/excerpt only; long bodies left English (flagged)
  "5btrC5PZe1xzIBzCuX8lar": {
    title: "මහරගම ජිම් මිල ගණන්: Dynamic Fitness එදිරිව Livestrong සැසඳීම",
  },
  "2DHPpUb45A3bqM2hYvPGvK": {
    title: "මහරගමින් නිවැරදි ජිම් එක තෝරා ගන්නේ කෙසේද: ප්‍රාදේශීය මාර්ගෝපදේශය",
    excerpt:
      "ඔබ සැබැවින්ම දිගටම යන මහරගම ජිම් එකක් තෝරා ගැනීමට ප්‍රාදේශීය මාර්ගෝපදේශයක් — ලියාපදිංචි වීමට පෙර පරීක්ෂා කළ යුතු දේ.",
  },

  // SEO
  "seo-home": {
    seoTitle: "Dynamic Fitness — ඔබේ හැකියාව මුදා හරින්න",
    seoDescription: "Dynamic Fitness හි පුද්ගලික පුහුණුව, කණ්ඩායම් පන්ති සහ පෝෂණ උපදේශනය.",
  },
  "seo-careers": {
    seoTitle: "Dynamic Fitness රැකියා අවස්ථා — නාවින්නේ අපගේ කණ්ඩායමට එක්වන්න",
    seoDescription:
      "නාවින්න, මහරගමේ Dynamic Fitness හි ඔබේ වෘත්තිය ගොඩනඟන්න. පුද්ගලික පුහුණුකරු, පුහුණු සහ පිළිගැනීමේ මේස තනතුරු සඳහා අයදුම් කරන්න.",
  },
  "seo-terms": {
    seoTitle: "භාවිත නියමයන් — Dynamic Fitness",
    seoDescription: "Dynamic Fitness වෙබ් අඩවිය භාවිතය පාලනය කරන නියමයන්.",
  },
  "seo-privacy": {
    seoTitle: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය — Dynamic Fitness",
    seoDescription: "Dynamic Fitness ඔබේ පෞද්ගලික තොරතුරු එකතු කරන, භාවිත කරන සහ ආරක්ෂා කරන ආකාරය.",
  },
  "seo-cookie-policy": {
    seoTitle: "කුකී ප්‍රතිපත්තිය — Dynamic Fitness",
    seoDescription: "මෙම වෙබ් අඩවියේ Dynamic Fitness කුකීස් භාවිත කරන ආකාරය සහ ඔබට ඇති තේරීම්.",
  },
  "seo-blog": {
    seoTitle: "බ්ලොගය — Dynamic Fitness",
    seoDescription: "Dynamic Fitness කණ්ඩායමෙන් පුහුණු ඉඟි, පෝෂණ මග පෙන්වීම සහ කතා.",
  },
  "31zCrvYTOoAC13S3o0jX7V": {
    seoTitle: "මහරගම ජිම් මිල ගණන්: Dynamic Fitness එදිරිව Livestrong සැසඳීම",
    seoDescription: "මහරගමේ හොඳම ජිම් දෙක අතර මිල සැසඳීම",
  },
  "seo-blog-maharagama": {
    seoTitle: "මහරගමින් නිවැරදි ජිම් එක තෝරා ගන්නේ කෙසේද: ප්‍රාදේශීය මාර්ගෝපදේශය",
    seoDescription:
      "මහරගම–හයිලෙවල් පාර ප්‍රදේශයේ ජිම් සසඳනවාද? ඔබ දිගටම යන එකක් තෝරා ගැනීමට ප්‍රාදේශීය මාර්ගෝපදේශයක්: ස්ථානය, උපකරණ, පුහුණුව සහ පිරිවැය.",
  },

  // CTAs
  "cta-careers-apply": { label: "දැන් අයදුම් කරන්න" },
  "cta-contact-us": { label: "අප හා සම්බන්ධ වන්න" },
  "cta-set-route": { label: "මාර්ගය සකසන්න" },
  "cta-sample": { label: "නොමිලේ උපදේශනයක් වෙන්කරවා ගන්න" },

  // Image alt text
  "2lgdIfXMEeFgmEV1qUh1ZC": { altText: "Dynamic Fitness එදිරිව Livestrong" },
  "img-step-support": { altText: "Dynamic Fitness හි පුහුණුකරු මෙහෙයවන පුහුණු සහාය" },
  "img-step-plan": { altText: "Dynamic Fitness හි පුද්ගලික පුහුණු සැලසුම් සැසියක්" },
  "img-step-progress": { altText: "Dynamic Fitness හි ප්‍රගතිය නිරීක්ෂණය කිරීම" },
  "img-step-consultation": { altText: "Dynamic Fitness හි නොමිලේ උපදේශනයක්" },
  "img-about-3": { altText: "කාඩියෝ ප්‍රදේශය" },
  "img-about-2": { altText: "ශක්ති පුහුණු ප්‍රදේශය" },
  "img-about-1": { altText: "ශක්ති පුහුණු කලාපය" },
  "img-about-main": { altText: "Dynamic Fitness පහසුකම් අභ්‍යන්තරය" },
  "4sMzddtNVCgXH70zOmWIAn": { altText: "මහරගමින් නිවැරදි ජිම් එක තෝරා ගන්නේ කෙසේද" },
  "27HdKT0YVtu574s72z9RHM": { altText: "Dynamic Fitness පහසුකම් බාහිරය" },

  // Videos
  "vid-step-support": { title: "පුහුණුකරු මෙහෙයවන සහාය", altText: "පුහුණුකරු මෙහෙයවන සහාය" },
  "vid-step-plan": { title: "පුද්ගලික පුහුණුව", altText: "පුද්ගලික පුහුණුව" },

  // Flexible page titles
  careers: { pageTitle: "රැකියා අවස්ථා" },
  terms: { pageTitle: "භාවිත නියමයන්" },
  "privacy-policy": { pageTitle: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය" },
  "cookie-policy": { pageTitle: "කුකී ප්‍රතිපත්තිය" },
  home: { pageTitle: "මුල් පිටුව" },
  blog: { pageTitle: "බ්ලොගය" },
};

let ok = 0;
let fail = 0;
for (const [id, fields] of Object.entries(T)) {
  try {
    const entry = await api(`/entries/${id}`);
    for (const [fid, val] of Object.entries(fields)) {
      const value = val && typeof val === "object" && "__rt" in val ? toRichText(val.__rt) : val;
      entry.fields[fid] = entry.fields[fid] || {};
      entry.fields[fid][SI] = value;
    }
    const updated = await api(`/entries/${id}`, {
      method: "PUT",
      headers: { "X-Contentful-Version": String(entry.sys.version) },
      body: JSON.stringify({ fields: entry.fields }),
    });
    await api(`/entries/${id}/published`, {
      method: "PUT",
      headers: { "X-Contentful-Version": String(updated.sys.version) },
    });
    console.log(`  ✓ ${id} (${Object.keys(fields).join(", ")})`);
    ok++;
  } catch (e) {
    console.error(`  ✗ ${id}: ${e.message.split("\n")[0]}`);
    fail++;
  }
}

console.log(`\n✅ Phase 2b done: ${ok} entries localized to si-LK${fail ? `, ${fail} failed` : ""}.`);
console.log("⚠ AI drafts — native review required. Legal bodies, long blog bodies, and reviews left in English.");
