"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";

import cardAssessment from "@/public/process/card-1-assessment.jpg";
import cardGoal from "@/public/process/card-2-goal.jpg";
import cardFoundation from "@/public/process/card-3-foundation.jpg";
import cardProgramming from "@/public/process/card-4-programming.webp";
import cardCoaching from "@/public/process/card-5-coaching.jpg";
import cardResults from "@/public/process/card-6-results.jpg";
import iconAssessment from "@/public/process/icon-1-assessment.svg";
import iconGoal from "@/public/process/icon-2-goal.svg";
import iconFoundation from "@/public/process/icon-3-foundation.svg";
import iconProgramming from "@/public/process/icon-4-programming.svg";
import iconCoaching from "@/public/process/icon-5-coaching.svg";
import iconResults from "@/public/process/icon-6-results.svg";
import iconTabProcess from "@/public/process/icon-tab-process.svg";

import styles from "./process.module.css";

/** Once-only in-view trigger; the cards and word effects fire at 50%. */
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

type Card = {
  n: string;
  title: string;
  copy: string;
  icon: StaticImageData;
  iconClass: string;
  image: StaticImageData;
  /** "image": photo fills the card under a dark gradient, media block is an
   * invisible spacer. "fill": blush card with the photo in the media block. */
  variant: "image" | "fill";
};

const CARDS: Card[] = [
  {
    n: "01",
    title: "Assessment",
    copy: "We assess fitness, goals, and movement patterns to set your baseline.",
    icon: iconAssessment,
    iconClass: "icoAssessment",
    image: cardAssessment,
    variant: "image",
  },
  {
    n: "02",
    title: "Goal Setting",
    copy: "We define clear 30, 60, and 90-day goals with a focused plan.",
    icon: iconGoal,
    iconClass: "icoGoal",
    image: cardGoal,
    variant: "fill",
  },
  {
    n: "03",
    title: "Foundation",
    copy: "We teach form, breathing, and core movements for safe training.",
    icon: iconFoundation,
    iconClass: "icoFoundation",
    image: cardFoundation,
    variant: "image",
  },
  {
    n: "04",
    title: "Programming",
    copy: "We build structured programs with progressive overload for growth.",
    icon: iconProgramming,
    iconClass: "icoProgramming",
    image: cardProgramming,
    variant: "fill",
  },
  {
    n: "05",
    title: "Coaching",
    copy: "We adapt every session in real time to drive better results.",
    icon: iconCoaching,
    iconClass: "icoCoaching",
    image: cardCoaching,
    variant: "image",
  },
  {
    n: "06",
    title: "Results",
    copy: "We track progress, celebrate wins, and raise the next target.",
    icon: iconResults,
    iconClass: "icoResults",
    image: cardResults,
    variant: "fill",
  },
];

/** One process card. A single 50%-threshold observer gates the card's rise
 * (the source's tween: opacity 0 / scale .95 / y 40 -> identity, .8s), the
 * number/copy fades, and the title's word reveal (500ms start + 50ms
 * stagger) — the card is invisible until then, so the grouping is exact. */
function ProcessCard({ card }: { card: Card }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const isImage = card.variant === "image";

  return (
    <div
      ref={ref}
      className={`${styles.card} ${isImage ? styles.cardImage : styles.cardFill}`}
      data-in={inView ? "true" : undefined}
    >
      {isImage ? (
        <>
          <span className={styles.cardBg} aria-hidden="true">
            <Image src={card.image} alt="" fill sizes="360px" />
          </span>
          <span className={styles.cardGrad} aria-hidden="true" />
        </>
      ) : null}
      <span className={styles.cardTexture} aria-hidden="true" />

      <div className={styles.cardHead}>
        <span className={`${styles.cardIcon} ${styles[card.iconClass]}`}>
          <Image src={card.icon} alt="" aria-hidden="true" />
        </span>
        <p className={styles.cardNum}>{card.n}</p>
      </div>

      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>
          {card.title.split(" ").map((word, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              <span
                className={styles.word}
                style={{ "--wd": `${i * 50}ms` } as CSSProperties}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h4>
        <p className={styles.cardCopy}>{card.copy}</p>
      </div>

      <div className={styles.cardMedia}>
        {!isImage ? (
          <Image src={card.image} alt="" aria-hidden="true" fill sizes="328px" />
        ) : null}
      </div>
    </div>
  );
}

export default function Process() {
  const [h2Ref, h2In] = useInView<HTMLHeadingElement>(0.5);
  const [subRef, subIn] = useInView<HTMLParagraphElement>(0);

  return (
    <section className={styles.process}>
      <div className={styles.container}>
        <div className={styles.headingBlock}>
          <div className={styles.tab}>
            <span className={styles.tabIcon}>
              <Image src={iconTabProcess} alt="" aria-hidden="true" />
            </span>
            <p className={styles.tabText}>Process</p>
          </div>

          <h2
            ref={h2Ref}
            className={styles.heading}
            data-in={h2In ? "true" : undefined}
          >
            {["Floor", "to", "Form"].map((word, i) => (
              <Fragment key={word}>
                {i > 0 ? " " : null}
                <span
                  className={styles.word}
                  style={{ "--wd": `${i * 50}ms` } as CSSProperties}
                >
                  {word}
                </span>
              </Fragment>
            ))}
          </h2>

          <p
            ref={subRef}
            className={styles.subcopy}
            data-in={subIn ? "true" : undefined}
          >
            We make getting fit easy, safe, and fun, no experience needed.
          </p>
        </div>

        <div className={styles.grid}>
          {CARDS.map((card) => (
            <ProcessCard key={card.n} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
