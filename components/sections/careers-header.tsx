"use client";

import { useEffect } from "react";
import type { CareersContent } from "@/lib/content-types";
import { careersDefaults } from "@/lib/content-defaults";

const CareersHeader = ({ content }: { content?: CareersContent }) => {
  const c = content ?? careersDefaults;

  useEffect(() => {
    if (window.UnicornStudio) {
      if (!window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
      return;
    }

    window.UnicornStudio = { isInitialized: false, init: () => {} };
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js";
    script.onload = () => {
      if (!window.UnicornStudio!.isInitialized) {
        window.UnicornStudio!.init();
        window.UnicornStudio!.isInitialized = true;
      }
    };
    document.head.appendChild(script);
  }, []);

  return (
    <section className="w-full border-t border-white/20 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          filter:
            "hue-rotate(130deg) saturate(2) brightness(0.8) contrast(1.1)",
        }}
      >
        <div
          data-us-project="bmaMERjX2VZDtPrh4Zwx"
          className="absolute inset-0"
        />
      </div>
      <div className="absolute inset-0 bg-black/40 pointer-events-none -z-10" />
      <div className="container lg:border-x lg:border-white/20 py-[80px] md:py-[120px] lg:py-[160px] relative z-10">
        <h1 className="text-white text-[32px] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
          {c.headline}
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-400 leading-relaxed max-w-lg">
          {c.description}
        </p>
      </div>
    </section>
  );
};

export default CareersHeader;
