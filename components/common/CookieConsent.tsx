"use client";

import { useEffect, useState } from "react";
import { CONSENT_COOKIE, getCookie, setCookie } from "@/lib/cookies";

/**
 * Cookie consent banner. Shows once until the visitor accepts or rejects, then
 * stores the choice in a cookie so it isn't shown again. Reading happens in an
 * effect (post-hydration) to avoid SSR mismatch — the banner simply fades in.
 *
 * The stored value (`df_cookie_consent`) is the gate any future analytics/ad
 * scripts should check before loading: only load them when it's "accepted".
 */

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(CONSENT_COOKIE)) setVisible(true);
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    setCookie(CONSENT_COOKIE, value, 180);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[#0d0d0d]/95 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-white/70">
          We use cookies to improve your experience and analyze site traffic. You can accept
          or reject non-essential cookies.{" "}
          <a
            href="/cookie-policy"
            className="text-white underline underline-offset-2 hover:text-red-400"
          >
            Learn more
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="cursor-pointer rounded-full border border-white/20 px-5 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-white"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="cursor-pointer rounded-full bg-red-500 px-5 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-600"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
