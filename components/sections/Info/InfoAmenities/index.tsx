"use client";

import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/lib/i18n/locale";
import type { InfoSection } from "@/lib/sections/types";
import { Maximize2, Snowflake, Activity, Dumbbell, Droplets, Shirt, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Info - Amenities. A bento grid of the gym's facilities, anchored by a large
 * "6,000 sq ft" hero cell. The section header (eyebrow + split headline) is
 * editable per-locale in Contentful (Info fields); the amenity cards are a
 * compact bilingual list in code — facility features that rarely change. Each
 * card reuses the site motifs: hairline border, dot/blueprint texture, a red
 * top-accent that glows on hover, and a mono index. Cards reveal with a
 * staggered fade-up on load (disabled under prefers-reduced-motion).
 */

type InfoAmenitiesProps = {
  section: InfoSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

type Copy = { label: string; desc: string };
type Amenity = {
  icon: LucideIcon;
  /** lg bento span; cells default to 1×1, "wide" cells span two columns. */
  wide?: boolean;
  en: Copy;
  si: Copy;
};

const HERO = {
  en: {
    eyebrow: "Training Floor",
    unit: "sq ft",
    caption: "A 6,000 square-foot training floor — room to move, lift, and breathe.",
  },
  si: {
    eyebrow: "පුහුණු බිම",
    unit: "වර්ග අඩි",
    caption: "වර්ග අඩි 6,000ක පුහුණු බිමක් — චලනය වීමට, බර එසවීමට සහ හුස්ම ගැනීමට ඉඩ.",
  },
};

// Order matters: the four 1×1 cells flow into the top-right block beside the
// hero; the two `wide` cells (the training zones) anchor the row beneath it.
const AMENITIES: Amenity[] = [
  {
    icon: Snowflake,
    en: { label: "Fully Air-Conditioned", desc: "Climate-controlled comfort through every session, year-round." },
    si: { label: "සම්පූර්ණ වායුසමීකරණය", desc: "සෑම පුහුණු සැසියකම, වසර පුරාම, පාලිත උෂ්ණත්ව සුවය." },
  },
  {
    icon: Droplets,
    en: { label: "Washrooms & Showers", desc: "Separate, spotless facilities with hot showers." },
    si: { label: "වැසිකිළි සහ ස්නානය", desc: "උණුසුම් ස්නාන සහිත වෙනම, පිරිසිදු පහසුකම්." },
  },
  {
    icon: Shirt,
    en: { label: "Changing Rooms", desc: "Private space and lockers to gear up and go." },
    si: { label: "ඇඳුම් මාරු කාමර", desc: "සැරසී පිටත්වීමට පෞද්ගලික ඉඩ සහ ලොකර්." },
  },
  {
    icon: Lightbulb,
    en: { label: "Aesthetic Lighting", desc: "Mood-tuned lighting that makes every rep look as good as it feels." },
    si: { label: "සෞන්දර්යාත්මක ආලෝකකරණය", desc: "සෑම අභ්‍යාසයක්ම දැනෙන තරම් අලංකාර කරවන මනෝභාවයට ගැළපෙන ආලෝකය." },
  },
  {
    icon: Activity,
    wide: true,
    en: { label: "Dedicated Cardio Zone", desc: "A floor of treadmills, bikes and rowers — all to yourself." },
    si: { label: "කැපවූ කාඩියෝ කලාපය", desc: "ට්‍රෙඩ්මිල්, බයිසිකල් සහ රෝවර් සහිත වෙනම මහලක් — සම්පූර්ණයෙන්ම ඔබට." },
  },
  {
    icon: Dumbbell,
    wide: true,
    en: { label: "CrossFit Arena", desc: "Rigs, boxes and open floor built for functional training." },
    si: { label: "ක්‍රොස්ෆිට් අංගනය", desc: "ක්‍රියාකාරී පුහුණුව සඳහා නිර්මිත රිග්, බොක්ස් සහ විවෘත බිම." },
  },
];

export function InfoAmenities({ section }: InfoAmenitiesProps) {
  const { sectionNumber, sectionLabel, headline, headlineFaded } = section;
  const slug = getLocaleFromPathname(usePathname() ?? "/").urlSlug;
  const lang = slug === "si" ? "si" : "en";
  const hero = HERO[lang];

  return (
    <section id="amenities" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
      <div className={`py-[60px] md:py-[80px] lg:border-x lg:border-white/20 lg:py-[100px] ${CONTAINER}`}>
        {/* Header — eyebrow + split headline, editable per-locale in Contentful */}
        {(sectionNumber || sectionLabel || headline) && (
          <div className="mb-10 flex flex-col gap-6 md:mb-14">
            {(sectionNumber || sectionLabel) && (
              <div className="flex items-center gap-4">
                {sectionNumber ? (
                  <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-white/70">
                    {sectionNumber}
                  </span>
                ) : null}
                {sectionNumber && sectionLabel ? <div className="h-4 w-px bg-white/20" /> : null}
                {sectionLabel ? (
                  <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-red-600">
                    {sectionLabel}
                  </span>
                ) : null}
              </div>
            )}
            {headline ? (
              <h2 className="max-w-2xl text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {headline}
                {headlineFaded ? (
                  <>
                    <br />
                    <span className="text-white/50">{headlineFaded}</span>
                  </>
                ) : null}
              </h2>
            ) : null}
          </div>
        )}

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(190px,auto)]">
          {/* Hero — the floor size */}
          <div
            className="group relative animate-fade-up overflow-hidden border border-white/10 bg-white/[0.02] p-8 md:col-span-2 lg:row-span-2 lg:p-10"
            style={{ animationDelay: "0ms" }}
          >
            {/* Blueprint grid texture */}
            <div
              aria-hidden
              className="absolute inset-0 z-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px]"
            />
            {/* Red corner glow */}
            <div aria-hidden className="absolute -right-16 -top-16 z-0 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />
            {/* Hover top accent */}
            <div
              aria-hidden
              className="absolute left-0 top-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-opacity duration-500 group-hover:opacity-100"
            />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                <Maximize2 className="h-4 w-4 text-red-400" strokeWidth={1.5} aria-hidden />
                {hero.eyebrow}
              </div>
              <div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-normal leading-[0.85] tracking-tighter text-white sm:text-7xl lg:text-[5.5rem]">
                    6,000
                  </span>
                  <span className="mb-1.5 font-serif text-2xl italic text-red-400 lg:text-3xl">{hero.unit}</span>
                </div>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-300 md:text-base">{hero.caption}</p>
              </div>
            </div>
          </div>

          {/* Amenity cells */}
          {AMENITIES.map((a, i) => {
            const Icon = a.icon;
            const copy = a[lang];
            return (
              <div
                key={copy.label}
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
                className={`group relative animate-fade-up overflow-hidden border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:bg-white/[0.04] lg:p-8 ${
                  a.wide ? "md:col-span-2" : ""
                }`}
              >
                {/* Dot texture */}
                <div
                  aria-hidden
                  className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:6px_6px] opacity-30"
                />
                {/* Hover top accent */}
                <div
                  aria-hidden
                  className="absolute left-0 top-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-red-400 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-red-500/40 group-hover:text-red-300">
                      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.2em] text-white/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-medium tracking-tight text-white">{copy.label}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">{copy.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default InfoAmenities;
