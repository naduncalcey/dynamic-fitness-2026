import Hero from "@/components/sections/hero";
import Header from "@/components/layout/header";
import About from "@/components/sections/about";
import Pricing from "@/components/sections/pricing";
import SingleTestimonial from "@/components/sections/single-testimonial";
import CTA from "@/components/sections/cta";
import FAQ from "@/components/sections/faq";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="bg-black/100">
      <Header />
      <Hero />
      <About />
      <Pricing />
      <SingleTestimonial />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
