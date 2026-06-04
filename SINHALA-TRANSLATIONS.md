# Sinhala (සිංහල) Translation Sheet — Dynamic Fitness

**Purpose:** Record of the AI machine-draft EN → SI translations, for a **native
Sinhala speaker to review and polish in Contentful.** The drafts are already
**applied and live** in the `si-LK` locale — review happens in Contentful now,
not in this file. This sheet is the reference/changelog.

## ✅ Status — what's already applied in Contentful
- **`si-LK` locale** created (fallback `en-US`) — untranslated fields show English, never blank.
- **UI chrome** → 54 `uiLabel` entries (key + localized `value`). The tables below
  are the source. Review: open each `uiLabel` entry → edit the **si-LK `value`**.
- **Page content** → si-LK values written onto 61 content entries (hero, pricing,
  FAQ, accordions, banners, careers form, CTAs, SEO, alt text, page titles, blog
  titles/excerpts). Review: open the entry in Contentful, switch to si-LK.
- The site is **bilingual now**: English at `/`, Sinhala at `/si`, switchable from the header.

## ⚠ Needs a human (NOT machine-translated — intentionally English for now)
These fall back to English on `/si` until a person translates them:
1. **Legal page bodies** — Terms, Privacy, Cookie Policy (`info-terms`, `info-privacy`,
   `info-cookie-policy` → `body`). Legal text shouldn't be machine-translated.
2. **Long blog article bodies** — both posts' `body` (≈4k & ≈6k chars, with tables/links).
   Titles + the excerpt are translated; bodies are not.
3. **Customer reviews** (`review-1/2/3`) — verbatim Google quotes; translating real
   people's words misrepresents them. Translate only with attribution note, or leave.

## How to review the drafts
1. In Contentful, set the locale toggle to **සිංහල (si-LK)** and walk the entries above.
2. Pay special attention to rows/fields marked **⚠** — marketing tone, split
   headlines (Hero/Banner), and the cookie/legal copy are where AI is least reliable.
3. Edit + republish. No code change needed — the site reads the updated values.

## Important caveats (read first)
- **Register / tone.** Sinhala has a written–spoken split (diglossia). These drafts
  use the formal written register with polite imperatives (…න්න), which suits web
  UI — but a native speaker should confirm it doesn't read stiff for *marketing* copy.
- **Terms kept in English on purpose:** brand names (Dynamic Fitness, FitConnect),
  fitness jargon (HIIT), file formats (PDF, Word, CV), and the email/phone
  placeholders. This matches how Sri Lankan sites normally render them.
- **These are drafts, not final.** Do not publish unreviewed — the BestWeb.LK local-
  relevance category is judged by native speakers who will spot awkward phrasing.

## Scope — what this sheet covers vs. doesn't
- ✅ **Covers:** the UI "chrome" strings (header, footer, forms, cookie banner, blog UI).
  These are now `uiLabel` entries in Contentful (no longer hardcoded in code).
- ❌ **Does NOT cover:** page *content* (hero headline, section copy, pricing plan
  names/descriptions, testimonials, FAQ, blog posts). That lives in **Contentful** and
  must be translated there, in the `si-LK` locale, after it's added (Settings → Locales,
  fallback `en-US`).
- ❌ **SEO** title/description for Sinhala pages are set per-page in Contentful, not here.

---

## 1. Header — `components/layout/Header.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| About | අප ගැන | |
| Pricing | මිල ගණන් | ⚠ Alt: **ගාස්තු** (fees) may fit gym memberships better |
| Blog | බ්ලොගය | Many SL sites keep "Blog" — reviewer's call |
| Careers | රැකියා අවස්ථා | |
| Toggle menu *(aria-label)* | මෙනුව විවෘත/වසන්න | |
| Change language — current: {lang} *(aria-label)* | භාෂාව වෙනස් කරන්න — දැනට: {lang} | |

---

## 2. Footer — `components/layout/Footer.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| Nawinna's premier fitness destination. | නාවින්නේ අංක එකේ ශාරීරික යෝග්‍යතා මධ්‍යස්ථානය. | ⚠ Literal; a native marketing rephrase may be punchier |
| Services *(group title)* | සේවාවන් | |
| Resources *(group title)* | සම්පත් | |
| Company *(group title)* | සමාගම | |
| Personal Training | පුද්ගලික පුහුණුව | |
| HIIT Classes | HIIT පන්ති | HIIT kept in English |
| FitConnect App | FitConnect යෙදුම | Brand kept; යෙදුම = app |
| Class Schedule | පන්ති කාලසටහන | |
| FAQs | නිතර අසන පැන | |
| About Us | අප ගැන | |
| Contact | සම්බන්ධ වන්න | |
| START NOW // *(CTA prefix)* | දැන්ම ආරම්භ කරන්න // | |
| Book a Free Consultation *(CTA)* | නොමිලේ උපදේශනයක් වෙන්කරවා ගන්න | ⚠ Alt: නොමිලේ සාකච්ඡාවක් සඳහා වේලාවක් වෙන්කරගන්න |
| Open 5.30 AM – 11.00 PM (Weekdays + Saturday) / 6.00 AM – 11.30 AM (Sunday) | විවෘතයි: පෙ.ව. 5.30 – ප.ව. 11.00 (සතියේ දිනවල + සෙනසුරාදා) / පෙ.ව. 6.00 – පෙ.ව. 11.30 (ඉරිදා) | පෙ.ව.=AM, ප.ව.=PM |
| Privacy | පෞද්ගලිකත්වය | |
| Terms | කොන්දේසි | |
| Cookie Policy | කුකී ප්‍රතිපත්තිය | |
| Dynamic Fitness (Pvt) Ltd. + address | *(keep in English)* | ⚠ Postal addresses usually kept in English; optional SI: අංක 14, දේවානන්ද පාර, නාවින්න, මහරගම — verify street spelling |
| © 2026 Dynamic Fitness | *(keep)* | Brand + year |

---

## 3. Cookie banner — `components/common/CookieConsent.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| We use cookies to improve your experience and analyze site traffic. You can accept or reject non-essential cookies. | ඔබගේ අත්දැකීම වැඩිදියුණු කිරීමටත්, වෙබ් අඩවියේ ගමනාගමනය විශ්ලේෂණය කිරීමටත් අපි කුකීස් භාවිතා කරමු. අත්‍යවශ්‍ය නොවන කුකීස් පිළිගැනීමට හෝ ප්‍රතික්ෂේප කිරීමට ඔබට හැකිය. | ⚠ Legal-ish; reviewer should confirm phrasing |
| Learn more | තවත් දැනගන්න | |
| Reject | ප්‍රතික්ෂේප කරන්න | |
| Accept | පිළිගන්න | |
| Cookie consent *(aria-label)* | කුකී කැමැත්ත | |

---

## 4. Careers form — `components/sections/CareersForm/CareersFormDefault/index.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| Full Name * | සම්පූර්ණ නම * | |
| Jane Doe *(placeholder)* | උදා: කමල් පෙරේරා | Localized example name |
| Email * | විද්‍යුත් තැපෑල * | Or keep "ඊමේල්" |
| Phone | දුරකථනය | |
| Position * | තනතුර * | |
| Select a position | තනතුරක් තෝරන්න | |
| General Application | සාමාන්‍ය අයදුම්පත | |
| Message | පණිවිඩය | |
| Tell us about yourself *(placeholder)* | ඔබ ගැන අපට කියන්න | |
| CV / Resume * (PDF or Word, max 5 MB) | ජීව දත්ත පත්‍රය / CV * (PDF හෝ Word, උපරිම 5 MB) | |
| Sending… | යවමින්… | |
| Submit Application | අයදුම්පත යවන්න | |
| Thanks! Your application has been sent. | ස්තූතියි! ඔබගේ අයදුම්පත සාර්ථකව යවා ඇත. | |
| Something went wrong. Please try again. | යම් දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න. | |
| Network error. Please try again. | ජාල දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න. | |

---

## 5. Blog listing — `components/sections/BlogListing/index.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| Search articles… *(placeholder + aria)* | ලිපි සොයන්න… | |
| No posts yet. Check back soon. | තවම ලිපි නැත. ඉක්මනින් නැවත පරීක්ෂා කරන්න. | |
| No articles match "{query}". | “{query}” සඳහා ගැළපෙන ලිපි නොමැත. | |

---

## 6. Pricing toggle — `components/sections/Info/InfoPricing/index.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| Individual | තනි පුද්ගල | |
| Couple | යුවළ | |
| Toggle individual or couple pricing *(aria-label)* | තනි හෝ යුවළ මිල ගණන් මාරු කරන්න | |

---

## 7. Blog post template — `components/templates/BlogPost/index.tsx`

| English (source) | Sinhala (draft) | Notes |
|---|---|---|
| Back to blog | බ්ලොගයට ආපසු | |

---

## 8. Date formatting — `components/blog/BlogPostCard.tsx` (lower priority)

Month abbreviations used in post dates. Optional — only matters if dates should
display in Sinhala. **⚠ Confirm these are the abbreviations Sri Lankans expect.**

| Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ජන | පෙබ | මාර්තු | අප්‍රේල් | මැයි | ජූනි | ජූලි | අගෝ | සැප් | ඔක් | නොවැ | දෙසැ |

---

## How it's wired (for developers)
- `uiLabel` content type holds chrome strings; `lib/contentful/uiLabels.ts` fetches
  all locales; `lib/i18n/LabelsProvider.tsx` provides `useLabels()`; the root layout
  feeds it. Components call `t("nav.about")`. Migrations: `scripts/seed-i18n.mjs`
  (locale + labels), `scripts/localize-fields.mjs` (field localization),
  `scripts/write-sinhala.mjs` (content drafts). All idempotent. Verify with
  `node scripts/check-i18n.mjs`.

## Remaining work
1. **Native review** of the si-LK drafts in Contentful (see "Needs a human" above).
2. Translate the 3 legal bodies + 2 blog article bodies + reviews (or leave English).
3. Optional: localize `<html lang>` per route and add `hreflang` alternates for SEO.
