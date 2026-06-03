import { buildLlmsFullTxt } from "@/lib/llms";

/**
 * /llms-full.txt — the full site content in one clean Markdown file (business
 * facts, membership plans, FAQ, and full blog articles) so AI can ingest
 * everything in a single fetch. Cached/revalidated hourly.
 */
export const revalidate = 3600;

export async function GET() {
  const body = await buildLlmsFullTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
