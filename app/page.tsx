import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Pricing from "@/components/sections/pricing";
import SingleTestimonial from "@/components/sections/single-testimonial";
import CTA from "@/components/sections/cta";
import FAQ from "@/components/sections/faq";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Pricing />
      <SingleTestimonial />
      <FAQ />
      <CTA />
    </>
  );
}
