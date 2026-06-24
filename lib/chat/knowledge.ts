import { buildLlmsFullTxt } from "@/lib/llms";

/**
 * Knowledge base for the chatbot. Reuses `buildLlmsFullTxt()` — the same
 * Contentful-synced Markdown that powers /llms-full.txt (business facts, pricing,
 * FAQ, blog) — so the bot's grounding stays in sync with the CMS automatically.
 *
 * The underlying Contentful fetches are already Next-data-cached, but the rich
 * text flattening + string assembly is not, so we memoize the final string in
 * module scope with a 1h TTL. Module state persists across requests on a warm
 * server instance; a cold start simply rebuilds it.
 */

const TTL_MS = 60 * 60 * 1000; // 1 hour, matching Contentful's revalidate window
/** Hard ceiling so a runaway CMS can't blow up the prompt (≈ tens of K tokens). */
const KB_MAX_CHARS = 120_000;

let cache: { value: string; builtAt: number } | null = null;
let inFlight: Promise<string> | null = null;

export async function getKnowledgeBase(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.builtAt < TTL_MS) return cache.value;
  // Collapse concurrent rebuilds (e.g. a burst of first requests) into one.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const full = await buildLlmsFullTxt();
      const value =
        full.length > KB_MAX_CHARS
          ? `${full.slice(0, KB_MAX_CHARS)}\n\n[content truncated]`
          : full;
      cache = { value, builtAt: Date.now() };
      return value;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
