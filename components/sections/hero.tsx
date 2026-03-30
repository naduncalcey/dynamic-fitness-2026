"use client";

import { useEffect } from "react";
import SpotlightButton from "../ui/spotlight-button";
import LogoScroll from "../ui/logo-scroll";
import type { HeroContent } from "@/lib/content-types";
import { heroDefaults } from "@/lib/content-defaults";

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => void;
    };
  }
}

const Hero = ({ content }: { content?: HeroContent }) => {
  const c = content ?? heroDefaults;

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
    <section className="w-full lg:border-y lg:border-white/20">
      <div className="relative z-10">
        <div className="container relative overflow-hidden py-[100px] md:py-[180px] lg:border-x lg:border-white/20">

          {/* Background confined to this container */}
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

            <h1 className="text-white text-[38px] leading-[42px] tracking-[-0.8px] md:text-[72px] md:leading-[72px] md:tracking-[-1.8px] font-normal pt-[20px] pb-[20px] md:pt-[40px]">
                {c.headline} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-500 font-serif italic font-normal">{c.highlightText}</span>
            </h1>
            <div className="pt-[40px]">
                <SpotlightButton onClick={() => window.open(c.ctaLink, "_blank")}>{c.ctaText}</SpotlightButton>
            </div>
        </div>
        <div className="container py-5 md:py-6 lg:!px-0 lg:border-t lg:border-x lg:border-white/20">
          <LogoScroll />
        </div>
      </div>
    </section>
  );
};

export default Hero;
