"use client";

import { useEffect } from "react";

/**
 * UnicornStudio WebGL background, ported from the previous site's hero. Loads
 * the UnicornStudio runtime once, then renders the scene into the
 * `data-us-project` div. Defaults match the live dynamicfitness.lk hero; pass
 * `projectId` / `scriptSrc` / `filter` to reuse it for other scenes (e.g. the
 * blog listing banner).
 */

const HERO_PROJECT_ID = "bmaMERjX2VZDtPrh4Zwx";
const HERO_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js";
const HERO_FILTER =
  "hue-rotate(130deg) saturate(2) brightness(0.8) contrast(1.1)";

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => void;
    };
  }
}

type UnicornBackgroundProps = {
  /** UnicornStudio project id rendered into the scene. */
  projectId?: string;
  /** CDN URL for the UnicornStudio runtime (pin the version per scene). */
  scriptSrc?: string;
  /** Optional CSS filter applied over the scene; pass null for none. */
  filter?: string | null;
};

export function UnicornBackground({
  projectId = HERO_PROJECT_ID,
  scriptSrc = HERO_SCRIPT_SRC,
  filter = HERO_FILTER,
}: UnicornBackgroundProps = {}) {
  useEffect(() => {
    // Runtime already present (e.g. another scene loaded it, or we navigated
    // here client-side): re-run init so it picks up THIS scene's div. init()
    // only touches not-yet-initialized scenes, so calling it again is safe.
    const u = window.UnicornStudio;
    if (u && typeof u.init === "function") {
      u.init();
      u.isInitialized = true;
      return;
    }

    // Reuse an in-flight script tag if one is already loading.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-unicorn-studio="true"]`
    );
    if (existing) {
      existing.addEventListener("load", () => window.UnicornStudio?.init());
      return;
    }

    window.UnicornStudio = { isInitialized: false, init: () => {} };

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.dataset.unicornStudio = "true";
    script.onload = () => {
      if (window.UnicornStudio) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
    };
    document.head.appendChild(script);
  }, [scriptSrc]);

  return (
    <div className="absolute inset-0 -z-10" style={filter ? { filter } : undefined}>
      <div data-us-project={projectId} className="absolute inset-0" />
    </div>
  );
}

export default UnicornBackground;
