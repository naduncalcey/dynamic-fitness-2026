"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import SpotlightButton from "../ui/spotlight-button";
import type { AboutContent } from "@/lib/content-types";
import { aboutDefaults } from "@/lib/content-defaults";

const CursorTooltip = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="relative"
    >
      {children}
      <div
        className="pointer-events-none absolute z-30 hidden md:flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black uppercase tracking-[0.1em] shadow-lg transition-opacity duration-200"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -120%)",
          opacity: visible ? 1 : 0,
        }}
      >
        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
        {label}
      </div>
    </div>
  );
};

const About = ({ content }: { content?: AboutContent }) => {
  const c = content ?? aboutDefaults;

  return (
    <section id="about" className="w-full scroll-mt-20">
      <div className="container lg:border-x lg:border-white/20 py-[60px] md:py-[80px] lg:py-[100px]">
        {/* Header row */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-[20px]">
          <div>
            <p className="text-[12px] font-medium text-white/70 uppercase tracking-[0.25em]">
              {c.sectionNumber}
              <span className="pl-4 ml-2 border-l border-white/20 text-[12px] font-medium text-red-600 uppercase tracking-[0.25em]">
                {c.sectionLabel}
              </span>
            </p>
            <h2 className="mt-6 md:mt-10 text-white text-[32px] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
              {c.headline}
              <br />
              <span className="text-white/50">{c.headlineFaded}</span>
            </h2>
          </div>
          <div className="md:py-12">
            <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-md">
              {c.description}
            </p>
            <SpotlightButton className="mt-6" onClick={() => window.open(c.ctaLink, "_blank")}>{c.ctaText}</SpotlightButton>
          </div>
        </div>

        {/* Main image */}
        <CursorTooltip label={c.imageTooltips[0]}>
          <div className="group relative mt-4 md:mt-6 overflow-hidden rounded-3xl cursor-none">
            <Image
              src="/output.webp"
              alt="About"
              width={1240}
              height={600}
              className="w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[600px] object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                mixBlendMode: "color",
              }}
            />
          </div>
        </CursorTooltip>

        {/* Three-image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
          {["/promo-1.webp", "/promo-2.webp", "/promo-3.webp"].map((src, i) => (
            <CursorTooltip key={i} label={c.imageTooltips[i + 1] ?? ""}>
              <div className="group relative overflow-hidden rounded-2xl cursor-none">
                <Image
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-[280px] sm:h-[160px] md:h-[200px] lg:h-[240px] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    mixBlendMode: "color",
                  }}
                />
              </div>
            </CursorTooltip>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
