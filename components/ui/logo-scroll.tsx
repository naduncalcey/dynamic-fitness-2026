"use client";

import { useState } from "react";
import Image from "next/image";

const logos = [
  { src: "/logos/fitconnect-logo.svg", alt: "FitConnect", url: "https://fitconnect.me" },
  { src: "/logos/track-logo.svg", alt: "Track", url: "https://track.lk" },
];

const repeated = [...Array(8)].flatMap(() => logos);

const Strip = ({ paused }: { paused: boolean }) => (
  <div
    className="flex shrink-0 items-center gap-16 pr-16 animate-marquee"
    style={{
      willChange: "transform",
      animationPlayState: paused ? "paused" : "running",
    }}
    aria-hidden
  >
    {repeated.map((logo, i) => (
      <a
        key={i}
        href={logo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center shrink-0 h-7 w-20 md:h-10 md:w-32 opacity-50 hover:opacity-80 transition-opacity duration-300"
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={128}
          height={40}
          className="object-contain h-full w-full"
        />
      </a>
    ))}
  </div>
);

const LogoScroll = () => {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden flex"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-black/60 to-transparent" />

      <Strip paused={paused} />
      <Strip paused={paused} />
    </div>
  );
};

export default LogoScroll;
