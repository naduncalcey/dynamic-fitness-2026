import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { CONTENT_CACHE_TAG } from "@/lib/contentful/client";

/**
 * On-demand revalidation endpoint for Contentful.
 *
 * Wire a Contentful webhook (Settings → Webhooks) to POST here on Entry/Asset
 * publish + unpublish so the statically-rendered pages refresh immediately,
 * instead of waiting for the ISR fallback window (CONTENT_REVALIDATE_SECONDS).
 *
 * Auth: the caller must present the shared secret from CONTENTFUL_REVALIDATE_SECRET,
 * via either the `x-revalidate-secret` header or a `?secret=` query param. The
 * route also sits under /api/, which robots.txt disallows.
 */

export const runtime = "nodejs";
// This is an action endpoint, never cached.
export const dynamic = "force-dynamic";

function isAuthorized(request: Request, secret: string): boolean {
  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");
  return provided === secret;
}

async function handle(request: Request) {
  const secret = process.env.CONTENTFUL_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Revalidation is not configured (missing CONTENTFUL_REVALIDATE_SECRET)." },
      { status: 500 }
    );
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Publishes are infrequent, so bust everything rather than mapping each entry
  // to the pages that reference it: every cached Contentful fetch (data cache)
  // plus every page under the root layout (full route cache). `{ expire: 0 }`
  // forces an immediate hard expiry (Next 16 requires the profile arg) so the
  // editor sees published changes on their very next request, not one later.
  revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, revalidated: true });
}

export const POST = handle;
// A manual GET (with the secret) makes it trivial to test from a browser/curl.
export const GET = handle;
