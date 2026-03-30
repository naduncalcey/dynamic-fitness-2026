export const dynamic = "force-dynamic";

import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Pricing from "@/components/sections/pricing";
import SingleTestimonial from "@/components/sections/single-testimonial";
import CTA from "@/components/sections/cta";
import FAQ from "@/components/sections/faq";
import { getContent } from "@/lib/content";
import type {
  HeroContent,
  AboutContent,
  PricingContent,
  TestimonialsContent,
  FAQContent,
  CTAContent,
} from "@/lib/content-types";

export default async function Home() {
  const [hero, about, pricing, testimonials, faq, cta] = await Promise.all([
    getContent<HeroContent>("home", "hero"),
    getContent<AboutContent>("home", "about"),
    getContent<PricingContent>("home", "pricing"),
    getContent<TestimonialsContent>("home", "testimonials"),
    getContent<FAQContent>("home", "faq"),
    getContent<CTAContent>("home", "cta"),
  ]);

  return (
    <>
      <Hero content={hero} />
      <About content={about} />
      <Pricing content={pricing} />
      <SingleTestimonial content={testimonials} />
      <FAQ content={faq} />
      <CTA content={cta} />
    </>
  );
}
