import { Fragment } from "react";

import About from "@/components/about/About";
import Banner from "@/components/banner/Banner";
import Faq from "@/components/faq/Faq";
import Hero from "@/components/hero/Hero";
import Numbers from "@/components/numbers/Numbers";
import Process from "@/components/process/Process";
import Programs from "@/components/programs/Programs";
import Testimonials from "@/components/testimonials/Testimonials";
import type { Block } from "@/sanity/blocks";

/** Renders the authored section list. Adding a block type means adding a case
 * here alongside its schema type. */
export default function PageBuilder({
  blocks,
}: {
  blocks: Block[] | null | undefined;
}) {
  if (!Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case "heroSection":
            return (
              <Fragment key={block._key}>
                <Hero
                  backgroundImage={block.backgroundImage}
                  ratingScore={block.ratingScore}
                  highlights={block.highlights}
                  contactCard={block.contactCard}
                  tagline={block.tagline}
                  ctas={block.ctas}
                />
                {/* Scroll target for the hero's arrow cue. */}
                <div id="hero-next" />
              </Fragment>
            );
          case "aboutSection":
            return (
              <About
                key={block._key}
                heading={block.heading}
                blocks={block.blocks}
                cta={block.cta}
                videoUrl={block.videoUrl}
              />
            );
          case "numbersSection":
            return <Numbers key={block._key} stats={block.stats} />;
          case "bannerSection":
            return <Banner key={block._key} image={block.image} />;
          case "programsSection":
            return (
              <Programs
                key={block._key}
                eyebrow={block.eyebrow}
                heading={block.heading}
                subcopy={block.subcopy}
                audienceToggle={block.audienceToggle}
                contactCard={block.contactCard}
                programs={block.programs}
              />
            );
          case "processSection":
            return (
              <Process
                key={block._key}
                eyebrow={block.eyebrow}
                heading={block.heading}
                subcopy={block.subcopy}
                steps={block.steps}
              />
            );
          case "testimonialsSection":
            return (
              <Testimonials
                key={block._key}
                eyebrow={block.eyebrow}
                heading={block.heading}
                subcopy={block.subcopy}
                testimonials={block.testimonials}
              />
            );
          case "faqSection":
            return (
              <Faq
                key={block._key}
                eyebrow={block.eyebrow}
                heading={block.heading}
                faqs={block.faqs}
                videoUrl={block.videoUrl}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
