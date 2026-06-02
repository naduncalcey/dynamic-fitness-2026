"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Partner-logo marquee shown below the hero, ported from the previous site.
 * Two duplicated strips scroll continuously; hover pauses them. Logos live in
 * public/logos/.
 */

const logos = [
  { src: "/logos/fitconnect-logo.svg", alt: "FitConnect", url: "https://fitconnect.me" },
  { src: "/logos/nutrimax.avif", alt: "NutriMax", url: "https://nutrimaxsupplements.com/" },
];

const repeated = [...Array(8)].flatMap(() => logos);

function Strip({ paused }: { paused: boolean }) {
  return (
    <div
      className="flex shrink-0 animate-marquee items-center gap-16 pr-16"
      style={{ willChange: "transform", animationPlayState: paused ? "paused" : "running" }}
      aria-hidden
    >
      {repeated.map((logo, i) => (
        <a
          key={i}
          href={logo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-20 shrink-0 items-center justify-center opacity-50 transition-opacity duration-300 hover:opacity-80 md:h-10 md:w-32"
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={128}
            height={40}
            className="h-full w-full object-contain"
          />
        </a>
      ))}
    </div>
  );
}

export function LogoScroll() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative flex w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black/60 to-transparent" />

      <Strip paused={paused} />
      <Strip paused={paused} />
    </div>
  );
}

export default LogoScroll;
