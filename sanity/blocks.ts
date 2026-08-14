import type { PAGE_QUERY_RESULT } from "@/sanity.types";

export type Page = NonNullable<PAGE_QUERY_RESULT>;

export type Block = NonNullable<Page["pageBuilder"]>[number];

type OfType<T extends Block["_type"]> = Extract<Block, { _type: T }>;

export type HeroBlock = OfType<"heroSection">;
export type AboutBlock = OfType<"aboutSection">;
export type NumbersBlock = OfType<"numbersSection">;
export type BannerBlock = OfType<"bannerSection">;
export type ProgramsBlock = OfType<"programsSection">;
export type ProcessBlock = OfType<"processSection">;
export type TestimonialsBlock = OfType<"testimonialsSection">;
export type FaqBlock = OfType<"faqSection">;

/** The shape every image in the page query is projected into. */
export type SanityImage = NonNullable<BannerBlock["image"]>;

/** The "Talk to CEO" / "Ask CEO" card, shared by the hero and programs. */
export type ContactCard = NonNullable<HeroBlock["contactCard"]>;
