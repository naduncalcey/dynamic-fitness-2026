"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import SanityImage from "@/components/shared/SanityImage";
import OrangeTicker from "@/components/ticker/OrangeTicker";
import iconCheck from "@/public/testimonials/icon-check.svg";
import iconQuote from "@/public/testimonials/icon-quote.svg";
import iconTabTestimonials from "@/public/testimonials/icon-tab-testimonials.svg";
import type { TestimonialsBlock } from "@/sanity/blocks";

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

type Testimonial = NonNullable<TestimonialsBlock["testimonials"]>[number];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className={styles.card}>
      <span className={styles.cardBg} aria-hidden="true">
        <SanityImage image={t.image} alt="" fill sizes="370px" />
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

export default function Testimonials({
  eyebrow,
  heading,
  subcopy,
  testimonials,
}: Pick<
  TestimonialsBlock,
  "eyebrow" | "heading" | "subcopy" | "testimonials"
>) {
  const [subRef, subIn] = useInView<HTMLParagraphElement>(0);
  const [t1, t2, t3, t4, t5] = testimonials ?? [];

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
            <p className={styles.tabText}>{eyebrow}</p>
          </div>
          <h2 className={styles.heading}>{heading}</h2>
          <p
            ref={subRef}
            className={styles.subcopy}
            data-in={subIn ? "true" : undefined}
          >
            {subcopy}
          </p>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.row}>
          {t1 ? <TestimonialCard t={t1} /> : null}
          {t2 ? (
            <div className={styles.offset}>
              <TestimonialCard t={t2} />
            </div>
          ) : null}
        </div>

        <div className={`${styles.row} ${styles.rowSingle}`}>
          {t3 ? <TestimonialCard t={t3} /> : null}
        </div>

        <div className={`${styles.row} ${styles.rowLast}`}>
          {t4 ? (
            <div className={styles.offset}>
              <TestimonialCard t={t4} />
            </div>
          ) : null}
          {t5 ? <TestimonialCard t={t5} /> : null}
        </div>

        <div className={styles.spacer} aria-hidden="true" />
      </div>
    </section>
  );
}
