import type {
  AccordionItemEntry,
  CtaEntry,
  ImageEntry,
  PricingPlanEntry,
  ReviewEntry,
  RichTextField,
  VideoEntry,
} from "@/lib/contentful/common/types";
import type { AuthorEntry, BlogPostCard } from "@/lib/contentful/blog/types";

export type ImageAsset = {
  url: string | null;
  width?: number | null;
  height?: number | null;
};

export type SeoEntry = {
  sys: { id: string };
  seoTitle?: string | null;
  seoDescription?: string | null;
  /** Optional social-share overrides; fall back to seoTitle/seoDescription. */
  seoOgTitle?: string | null;
  seoOgDescription?: string | null;
  seoOgImage?: ImageAsset | null;
  seoNoIndex?: boolean | null;
  seoNoFollow?: boolean | null;
  seoCanonicalUrl?: string | null;
  seoSchemaMarkup?: unknown | null;
};

/**
 * Every concrete section extends BaseSection and sets a unique `type` literal.
 * Add your section types to the `Section` union below as you build them out.
 * See `components/ARCHITECTURE.md` for the full pattern.
 */
export type BaseSection = {
  id: string;
  type: string;
};

export type UnknownSection = BaseSection & {
  type: "unknown";
  raw: unknown;
};

/** Variant values for the Hero `frontEndComponent` field. */
export type HeroFrontEndComponent = "Hero - default";

export type HeroSection = BaseSection & {
  type: "hero";
  frontEndComponent: HeroFrontEndComponent | string | null;
  eyebrow: string | null;
  headline: string | null;
  highlightText: string | null;
  subheading: RichTextField | null;
  backgroundImage: ImageEntry | null;
  backgroundVideo: VideoEntry | null;
  ctas: CtaEntry[];
};

/** A single metric in the Info "Image Explainer" stats band. */
export type InfoStat = { label: string; value: string };

/** Variant values for the Info `frontEndComponent` field. */
export type InfoFrontEndComponent =
  | "Info - Image Explainer"
  | "Info - Pricing"
  | "Info - Default";

export type InfoSection = BaseSection & {
  type: "info";
  frontEndComponent: InfoFrontEndComponent | string | null;
  sectionNumber: string | null;
  sectionLabel: string | null;
  headline: string | null;
  headlineFaded: string | null;
  // Default (rich text article)
  body: RichTextField | null;
  // Image Explainer
  description: RichTextField | null;
  /** Metrics band rendered under the About text (label + value pairs). */
  stats: InfoStat[];
  imageTooltips: string[];
  cta: CtaEntry | null;
  mainImage: ImageEntry | null;
  galleryImages: ImageEntry[];
  // Pricing
  coupleDiscountLabel: string | null;
  /** Short disclaimer rendered under the pricing cards (e.g. admission fee). */
  admissionFeeNote: string | null;
  individualPlans: PricingPlanEntry[];
  couplePlans: PricingPlanEntry[];
};

/** Variant values for the Testimonial `frontEndComponent` field. */
export type TestimonialFrontEndComponent = "Testimonial - Default";

export type TestimonialSection = BaseSection & {
  type: "testimonial";
  frontEndComponent: TestimonialFrontEndComponent | string | null;
  reviews: ReviewEntry[];
};

/** Variant values for the Accordion `frontEndComponent` field. */
export type AccordionFrontEndComponent = "Accordion - FAQ" | "Accordion - Steps";

export type AccordionSection = BaseSection & {
  type: "accordion";
  frontEndComponent: AccordionFrontEndComponent | string | null;
  sectionNumber: string | null;
  sectionLabel: string | null;
  headline: string | null;
  description: RichTextField | null;
  cta: CtaEntry | null;
  items: AccordionItemEntry[];
};

/** Variant values for the Banner `frontEndComponent` field. */
export type BannerFrontEndComponent = "Banner - CTA" | "Banner / Team" | "Banner / Map";

export type BannerSection = BaseSection & {
  type: "banner";
  frontEndComponent: BannerFrontEndComponent | string | null;
  headline: string | null;
  highlightWord: string | null;
  description: RichTextField | null;
  cta: CtaEntry | null;
  backgroundImage: ImageEntry | null;
  /** Google Maps embed URL for the "Banner / Map" variant. */
  mapEmbedUrl: string | null;
  /**
   * Team members for the "Banner / Team" variant. Reuses the Author content
   * type so each person doubles as a blog author (name, role, avatar).
   */
  teamMembers: AuthorEntry[];
};

/** Variant values for the CareersForm `frontEndComponent` field. */
export type CareersFormFrontEndComponent = "Careers Form";

export type CareersFormSection = BaseSection & {
  type: "careersForm";
  frontEndComponent: CareersFormFrontEndComponent | string | null;
  heading: string | null;
  description: RichTextField | null;
  positions: string[];
  successMessage: string | null;
};

/** Variant values for the ContactForm `frontEndComponent` field. */
export type ContactFormFrontEndComponent = "Contact Form";

export type ContactFormSection = BaseSection & {
  type: "contactForm";
  frontEndComponent: ContactFormFrontEndComponent | string | null;
  heading: string | null;
  description: RichTextField | null;
  successMessage: string | null;
};

/** A single job opening (the `job` content type), listed by JobListings. */
export type JobEntry = {
  id: string;
  title: string | null;
  slug: string | null;
  employmentType: string | null;
  location: string | null;
  department: string | null;
  summary: string | null;
  description: RichTextField | null;
  responsibilities: string[];
  requirements: string[];
  compensation: string | null;
  /** Raw ISO date (used for JobPosting structured data). */
  postedDate: string | null;
  /** Locale-formatted posted date, pre-rendered server-side for hydration safety. */
  postedDisplay: string | null;
};

/** Variant values for the JobListings `frontEndComponent` field. */
export type JobListingsFrontEndComponent = "Job Listings";

export type JobListingsSection = BaseSection & {
  type: "jobListings";
  frontEndComponent: JobListingsFrontEndComponent | string | null;
  heading: string | null;
  description: RichTextField | null;
  emptyMessage: string | null;
  jobs: JobEntry[];
};

/** Variant values for the BlogListing `frontEndComponent` field. */
export type BlogListingFrontEndComponent = "Blog Listing - Default";

export type BlogListingSection = BaseSection & {
  type: "blogListing";
  frontEndComponent: BlogListingFrontEndComponent | string | null;
  heading: string | null;
  description: RichTextField | null;
  posts: BlogPostCard[];
};

export type Section =
  | UnknownSection
  | HeroSection
  | InfoSection
  | TestimonialSection
  | AccordionSection
  | BannerSection
  | CareersFormSection
  | ContactFormSection
  | JobListingsSection
  | BlogListingSection;
