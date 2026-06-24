import { Snowflake, Activity, Dumbbell, Droplets, Shirt, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Gym facilities — the single source of truth for the Info - Amenities section.
 * These rarely change and are bilingual in code (not Contentful). Both the
 * InfoAmenities component AND the chatbot knowledge base (lib/llms.ts) read from
 * here, so the assistant can answer facility questions ("is the gym
 * air-conditioned?") from the same list the page renders.
 */

export type Copy = { label: string; desc: string };
export type Amenity = {
  icon: LucideIcon;
  /** lg bento span; cells default to 1×1, "wide" cells span two columns. */
  wide?: boolean;
  en: Copy;
  si: Copy;
};

export const HERO = {
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
export const AMENITIES: Amenity[] = [
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
