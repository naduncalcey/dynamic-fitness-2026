"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";

import OrangeTicker from "@/components/ticker/OrangeTicker";
import bannerFighter from "@/public/banner/banner-fighter.webp";
import iconCheck from "@/public/testimonials/icon-check.svg";
import iconQuote from "@/public/testimonials/icon-quote.svg";
import iconTabTestimonials from "@/public/testimonials/icon-tab-testimonials.svg";
import user1 from "@/public/testimonials/user-1.webp";
import user3 from "@/public/testimonials/user-3.jpg";
import user4 from "@/public/testimonials/user-4.jpg";
import user5 from "@/public/testimonials/user-5.jpg";

import styles from "./testimonials.module.css";

/** Once-only in-view trigger for the text fades. */
function useInView<T extends HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function Fade({ className, children }: { className: string; children: ReactNode }) {
  const [ref, inView] = useInView<HTMLParagraphElement>(0);
  return (
    <p ref={ref} className={className} data-in={inView ? "true" : undefined}>
      {children}
    </p>
  );
}

type Testimonial = {
  quote: string;
  name: string;
  location: string;
  program: string;
  image: StaticImageData;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "“From my first session to my first pull-up, every milestone felt like a massive celebration.”",
    name: "Brittany H.",
    location: "Austin, TX",
    program: "Beginner Bootcamp • 4 weeks",
    image: user1,
  },
  {
    quote:
      "“The coaches push you just. I never knew fitness could be this enjoyable.”",
    name: "Marcus",
    location: "Chicago, IL",
    program: "Strength & Conditioning ",
    image: bannerFighter,
  },
  {
    quote:
      "“This gym changed my life, I lost 30 lbs and gained confidence I didn’t know I had.”",
    name: "Steve J.",
    location: "Houston, TX",
    program: "Weight Loss Program • 8 weeks",
    image: user3,
  },
  {
    quote:
      "“The coaches’ energy turned my fear of the gym into a full-on obsession with lifting.”",
    name: "Travis R.",
    location: "Los Angeles, CA",
    program: "Advanced Training • 1-on-1 Coaching",
    image: user4,
  },
  {
    quote:
      "“From my first session to my first pull-up, every milestone felt like a massive celebration.”",
    name: "Brittany H.",
    location: "Austin, TX",
    program: "Strength & Conditioning  • 12 weeks",
    image: user5,
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className={styles.card}>
      <span className={styles.cardBg} aria-hidden="true">
        <Image src={t.image} alt="" fill sizes="370px" />
      </span>
      <span className={styles.cardOverlay} aria-hidden="true" />

      <div className={styles.cardTop}>
        <span className={styles.quoteIcon} aria-hidden="true">
          <Image src={iconQuote} alt="" />
        </span>
        <Fade className={styles.quote}>{t.quote}</Fade>
        <div className={styles.nameBlock}>
          <Fade className={styles.name}>{t.name}</Fade>
          <Fade className={styles.name}>{t.location}</Fade>
        </div>
      </div>

      <div className={styles.cardBottom}>
        <span className={styles.cardLine} aria-hidden="true" />
        <div className={styles.progRow}>
          <span className={styles.checkIcon} aria-hidden="true">
            <Image src={iconCheck} alt="" />
          </span>
          <Fade className={styles.program}>{t.program}</Fade>
        </div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [subRef, subIn] = useInView<HTMLParagraphElement>(0);
  const [t1, t2, t3, t4, t5] = TESTIMONIALS;

  return (
    <section className={styles.testimonials}>
      <OrangeTicker />

      {/* Pins to the viewport (z 1) while the card rows (z 2) scroll over it,
       * fading it out behind the cards wrap's bottom-heavy gradient. */}
      <div className={styles.sticky}>
        <div className={styles.headingBlock}>
          <div className={styles.tab}>
            <span className={styles.tabIcon}>
              <Image src={iconTabTestimonials} alt="" aria-hidden="true" />
            </span>
            <p className={styles.tabText}>Testimonials</p>
          </div>
          <h2 className={styles.heading}>Members&rsquo; Words</h2>
          <p
            ref={subRef}
            className={styles.subcopy}
            data-in={subIn ? "true" : undefined}
          >
            Real stories from people who showed up, put in the work, and
            changed their lives.
          </p>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.row}>
          <TestimonialCard t={t1} />
          <div className={styles.offset}>
            <TestimonialCard t={t2} />
          </div>
        </div>

        <div className={`${styles.row} ${styles.rowSingle}`}>
          <TestimonialCard t={t3} />
        </div>

        <div className={`${styles.row} ${styles.rowLast}`}>
          <div className={styles.offset}>
            <TestimonialCard t={t4} />
          </div>
          <TestimonialCard t={t5} />
        </div>

        <div className={styles.spacer} aria-hidden="true" />
      </div>
    </section>
  );
}
