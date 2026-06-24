/**
 * Minimal in-memory, per-IP sliding-window rate limiter for /api/chat. There's
 * no datastore in this project, so this is intentionally simple: it bounds cost
 * and casual abuse from a single client. It is per-instance (resets on cold
 * start, not shared across instances) — acceptable for this site's scale. Swap
 * for a shared store (e.g. Redis) if the site is ever horizontally scaled.
 */

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 20; // per IP per window

const hits = new Map<string, number[]>();

/** Read the client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(ip: string): { ok: boolean } {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return { ok: false };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return { ok: true };
}
