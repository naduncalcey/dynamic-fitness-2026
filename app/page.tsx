import About from "@/components/about/About";
import Banner from "@/components/banner/Banner";
import Faq from "@/components/faq/Faq";
import Hero from "@/components/hero/Hero";
import Numbers from "@/components/numbers/Numbers";
import Process from "@/components/process/Process";
import Programs from "@/components/programs/Programs";
import Testimonials from "@/components/testimonials/Testimonials";
import bannerBoxer from "@/public/banner/banner-boxer.webp";
import bannerFighter from "@/public/banner/banner-fighter.webp";
import bannerHands from "@/public/banner/banner-hands.webp";
import bannerSled from "@/public/banner/banner-sled.webp";

export default function Home() {
  return (
    <>
      <Hero />
      {/* Scroll target for the hero's arrow cue. */}
      <div id="hero-next" />
      <About />
      <Numbers />
      <Banner
        image={bannerFighter}
        alt="Fighter with wraps in a knee-strike stance against an orange backdrop."
        rise={30}
        position="50% 0%"
      />
      <Programs />
      <Banner
        image={bannerSled}
        alt="Man doing a sled push workout in a dimly lit gym."
      />
      <Process />
      <Banner
        image={bannerBoxer}
        alt="Boxer in red gloves in a training stance beside a heavy bag."
      />
      <Testimonials />
      <Banner
        image={bannerHands}
        alt="Smiling group's hands reach together, R logo in center, viewed from below."
      />
      <Faq />
    </>
  );
}
