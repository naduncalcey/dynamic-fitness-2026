import { SITE_NAME, SITE_URL, BUSINESS, absoluteUrl, richTextToPlainText } from "@/lib/seo";
import {
  getLlmsFaq,
  getLlmsPages,
  getLlmsPosts,
  getLlmsPricing,
} from "@/lib/contentful/llms";

/**
 * Builders for /llms.txt (a curated guide for AI) and /llms-full.txt (the full
 * content in one clean Markdown file). Both follow the llmstxt.org convention:
 * an H1, a `>` summary, then sections. Content is pulled from Contentful so the
 * files stay in sync with the CMS.
 */

const ONE_LINER =
  "Dynamic Fitness is Nawinna's premier gym in Maharagama, Sri Lanka — state-of-the-art equipment, certified personal trainers, group classes, and nutrition coaching.";

function businessFacts(): string {
  const { address, hours, telephone, priceRange } = BUSINESS;
  const hoursText = hours
    .map((h) => {
      const span = h.days.length > 1 ? `${h.days[0]}–${h.days[h.days.length - 1]}` : h.days[0];
      return `${span} ${h.opens}–${h.closes}`;
    })
    .join("; ");
  return [
    `- Location: ${address.street}, ${address.locality}, ${address.region}, Sri Lanka`,
    `- Phone: ${telephone}`,
    `- Opening hours: ${hoursText}`,
    `- Membership price range: ${priceRange}`,
    `- Website: ${SITE_URL}`,
  ].join("\n");
}

/** Build the short, curated /llms.txt guide. */
export async function buildLlmsTxt(): Promise<string> {
  const [pages, posts] = await Promise.all([getLlmsPages(), getLlmsPosts()]);

  const corePages = pages
    .filter((p) => !p.slug.startsWith("/blog"))
    .map((p) => {
      const path = p.slug.startsWith("/") ? p.slug : `/${p.slug}`;
      return `- [${p.title ?? path}](${absoluteUrl(path)})`;
    });

  const postLinks = posts.map((p) => {
    const url = absoluteUrl(`/blog/${(p.slug ?? "").replace(/^\/+/, "")}`);
    return `- [${p.title ?? "Untitled"}](${url})${p.excerpt ? `: ${p.excerpt}` : ""}`;
  });

  return [
    `# ${SITE_NAME}`,
    "",
    `> ${ONE_LINER}`,
    "",
    "## About",
    businessFacts(),
    "",
    "## Key pages",
    corePages.join("\n") || "- (none)",
    "",
    "## Blog",
    postLinks.join("\n") || "- (no posts yet)",
    "",
    "## More",
    `- [Full content for AI](${SITE_URL}/llms-full.txt)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
  ].join("\n");
}

/** Build the full-content /llms-full.txt file. */
export async function buildLlmsFullTxt(): Promise<string> {
  const [pricing, faq, posts] = await Promise.all([
    getLlmsPricing(),
    getLlmsFaq(),
    getLlmsPosts(),
  ]);

  const parts: string[] = [
    `# ${SITE_NAME} — Full Content`,
    "",
    `> ${ONE_LINER}`,
    "",
    "## About",
    businessFacts(),
  ];

  if (pricing.length) {
    parts.push("", "## Membership Plans");
    for (const plan of pricing) {
      const price = [plan.price, plan.priceSuffix].filter(Boolean).join(" ");
      parts.push(`\n### ${plan.name ?? "Plan"}${price ? ` — ${price}` : ""}`);
      if (plan.description) parts.push(plan.description);
      if (plan.features?.length) {
        parts.push(...plan.features.map((f) => `- ${f}`));
      }
    }
  }

  if (faq.length) {
    parts.push("", "## Frequently Asked Questions");
    for (const item of faq) {
      const q = (item.question ?? "").trim();
      const a = richTextToPlainText(item.answer).trim();
      if (q && a) parts.push(`\n### ${q}`, a);
    }
  }

  if (posts.length) {
    parts.push("", "## Blog Articles");
    for (const post of posts) {
      const url = absoluteUrl(`/blog/${(post.slug ?? "").replace(/^\/+/, "")}`);
      parts.push(`\n### ${post.title ?? "Untitled"}`);
      const meta = [post.category, post.publishedDate?.slice(0, 10)]
        .filter(Boolean)
        .join(" · ");
      if (meta) parts.push(`_${meta}_`);
      parts.push(`Source: ${url}`);
      const body = richTextToPlainText(post.body).trim();
      if (body) parts.push("", body);
    }
  }

  parts.push("");
  return parts.join("\n");
}
