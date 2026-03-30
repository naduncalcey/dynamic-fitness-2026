"use client";

import Image from "next/image";
import SpotlightButton from "../ui/spotlight-button";
import type { CTAContent } from "@/lib/content-types";
import { ctaDefaults } from "@/lib/content-defaults";

const CTA = ({ content }: { content?: CTAContent }) => {
  const c = content ?? ctaDefaults;

  return (
    <section className="w-full border-t border-white/20">
      <div className="container relative z-0 lg:border-x lg:border-white/20 py-[80px] md:py-[120px] lg:py-[160px] overflow-hidden">
        <Image
          src="/render.webp"
          alt=""
          fill
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-black/75 pointer-events-none z-[1]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-white text-[32px] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
            {c.headline}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-500 font-serif italic">
              {c.highlightWord}
            </span>
            ?
          </h2>

          <p className="mt-6 text-base md:text-lg text-gray-400 leading-relaxed max-w-lg">
            {c.description}
          </p>

          <div className="mt-10">
            <SpotlightButton variant="red" onClick={() => window.open(c.ctaLink, "_blank")}>{c.ctaText}</SpotlightButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
