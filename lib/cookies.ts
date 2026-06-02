/**
 * Minimal client-side cookie helpers. Safe to import anywhere — they no-op
 * during server rendering (no `document`).
 */

export function setCookie(name: string, value: string, days = 180): void {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/* Cookie names used across the app. */
export const CONSENT_COOKIE = "df_cookie_consent"; // "accepted" | "rejected"
export const PRICING_VIEW_COOKIE = "df_pricing_view"; // "individual" | "couple"
