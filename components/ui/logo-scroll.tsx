import Image from "next/image";

const logos = [
  { src: "/logos/fitconnect-logo.svg", alt: "FitConnect" },
  { src: "/logos/track-logo.svg", alt: "Track" },
];

// Repeat enough times so each strip is definitely wider than any viewport.
// pr-16 = same as gap-16 so the gap at the seam matches the gap between items.
const repeated = [...Array(8)].flatMap(() => logos);

const Strip = () => (
  <div
    className="flex shrink-0 items-center gap-16 pr-16 animate-marquee"
    style={{ willChange: "transform" }}
    aria-hidden
  >
    {repeated.map((logo, i) => (
      <div
        key={i}
        className="flex items-center justify-center shrink-0 h-7 w-20 md:h-10 md:w-32 opacity-50 hover:opacity-80 transition-opacity duration-300"
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={128}
          height={40}
          className="object-contain h-full w-full"
        />
      </div>
    ))}
  </div>
);

const LogoScroll = () => {
  return (
    <div className="relative w-full overflow-hidden flex">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-black/60 to-transparent" />

      <Strip />
      <Strip />
    </div>
  );
};

export default LogoScroll;
