import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt at /robots.txt. Allows all standard crawlers, explicitly welcomes
 * the major AI crawlers (so assistants can read and recommend the site), blocks
 * the non-content API route, and points to the sitemap.
 */

// AI / answer-engine crawlers we want to read the site. Listing them explicitly
// makes our intent clear and is easy to flip to `disallow` later if needed.
const AI_CRAWLERS = [
  "GPTBot", // OpenAI (ChatGPT training/browsing)
  "OAI-SearchBot", // OpenAI search
  "ChatGPT-User", // ChatGPT on-demand fetch
  "ClaudeBot", // Anthropic
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended", // Google Gemini / Vertex grounding
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "Meta-ExternalAgent", // Meta AI
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
