"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import HeadingWords from "@/components/shared/HeadingWords";
import SanityImage from "@/components/shared/SanityImage";
import iconAssessment from "@/public/process/icon-1-assessment.svg";
import iconGoal from "@/public/process/icon-2-goal.svg";
import iconFoundation from "@/public/process/icon-3-foundation.svg";
import iconProgramming from "@/public/process/icon-4-programming.svg";
import iconCoaching from "@/public/process/icon-5-coaching.svg";
import iconResults from "@/public/process/icon-6-results.svg";
import iconTabProcess from "@/public/process/icon-tab-process.svg";
import type { ProcessBlock } from "@/sanity/blocks";

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

type Step = NonNullable<ProcessBlock["steps"]>[number];

/** The schema's icon values map to the glyph and its sizing class. */
const ICONS = {
  assessment: [iconAssessment, "icoAssessment"],
  goal: [iconGoal, "icoGoal"],
  foundation: [iconFoundation, "icoFoundation"],
  programming: [iconProgramming, "icoProgramming"],
  coaching: [iconCoaching, "icoCoaching"],
  results: [iconResults, "icoResults"],
} as const;

/** One process card. A single 50%-threshold observer gates the card's rise
 * (the source's tween: opacity 0 / scale .95 / y 40 -> identity, .8s), the
 * number/copy fades, and the title's word reveal (500ms start + 50ms
 * stagger) — the card is invisible until then, so the grouping is exact. */
function ProcessCard({ step, index }: { step: Step; index: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  // The treatment alternates down the list: photo-filled, then blush card.
  const isImage = index % 2 === 0;
  const [icon, iconClass] = ICONS[step.icon as keyof typeof ICONS] ?? [];

  return (
    <div
      ref={ref}
      className={`${styles.card} ${isImage ? styles.cardImage : styles.cardFill}`}
      data-in={inView ? "true" : undefined}
    >
      {isImage ? (
        <>
          <span className={styles.cardBg} aria-hidden="true">
            <SanityImage image={step.image} alt="" fill sizes="360px" />
          </span>
          <span className={styles.cardGrad} aria-hidden="true" />
        </>
      ) : null}
      <span className={styles.cardTexture} aria-hidden="true" />

      <div className={styles.cardHead}>
        <span className={`${styles.cardIcon} ${styles[iconClass]}`}>
          {icon ? <Image src={icon} alt="" aria-hidden="true" /> : null}
        </span>
        <p className={styles.cardNum}>{String(index + 1).padStart(2, "0")}</p>
      </div>

      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>
          <HeadingWords text={step.title} wordClass={styles.word} />
        </h4>
        <p className={styles.cardCopy}>{step.copy}</p>
      </div>

      <div className={styles.cardMedia}>
        {!isImage ? (
          <SanityImage image={step.image} alt="" fill sizes="328px" />
        ) : null}
      </div>
    </div>
  );
}

export default function Process({
  eyebrow,
  heading,
  subcopy,
  steps,
}: Pick<ProcessBlock, "eyebrow" | "heading" | "subcopy" | "steps">) {
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
            <p className={styles.tabText}>{eyebrow}</p>
          </div>

          <h2
            ref={h2Ref}
            className={styles.heading}
            data-in={h2In ? "true" : undefined}
          >
            <HeadingWords text={heading} wordClass={styles.word} />
          </h2>

          <p
            ref={subRef}
            className={styles.subcopy}
            data-in={subIn ? "true" : undefined}
          >
            {subcopy}
          </p>
        </div>

        <div className={styles.grid}>
          {steps?.map((step, i) => (
            <ProcessCard key={step._key} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
