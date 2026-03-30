export interface HeroContent {
  headline: string;
  highlightText: string;
  ctaText: string;
  ctaLink: string;
}

export interface AboutContent {
  sectionNumber: string;
  sectionLabel: string;
  headline: string;
  headlineFaded: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageTooltips: string[];
}

export interface PlanFeature {
  text: string;
  accent?: boolean;
}

export interface Plan {
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
}

export interface PricingContent {
  sectionNumber: string;
  sectionLabel: string;
  headline: string;
  headlineFaded: string;
  coupleDiscountLabel: string;
  ctaLink: string;
  individualPlans: Plan[];
  couplePlans: Plan[];
}

export interface Testimonial {
  name: string;
  photo: string;
  rating: number;
  text: string;
  time: string;
}

export interface TestimonialsContent {
  testimonials: Testimonial[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContent {
  sectionNumber: string;
  sectionLabel: string;
  headline: string;
  description: string;
  contactCtaText: string;
  faqs: FAQItem[];
}

export interface CTAContent {
  headline: string;
  highlightWord: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export interface CareersContent {
  headline: string;
  description: string;
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterContent {
  description: string;
  linkGroups: FooterLinkGroup[];
  ctaPrefix: string;
  ctaText: string;
  ctaLink: string;
  brandText: string;
  hours: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderContent {
  navLinks: NavLink[];
}

export type SectionContent =
  | HeroContent
  | AboutContent
  | PricingContent
  | TestimonialsContent
  | FAQContent
  | CTAContent
  | CareersContent
  | FooterContent
  | HeaderContent;

export interface ContentRecord {
  page: string;
  section: string;
  content: SectionContent;
}
