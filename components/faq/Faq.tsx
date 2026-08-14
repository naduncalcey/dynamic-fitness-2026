"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import HeadingWords from "@/components/shared/HeadingWords";
import iconTabFaq from "@/public/faq/icon-tab-faq.svg";
import rLogo from "@/public/faq/r-logo.svg";
import type { FaqBlock } from "@/sanity/blocks";

import styles from "./faq.module.css";

/** Once-only in-view trigger. */
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

type Faq = NonNullable<FaqBlock["faqs"]>[number];

/** The X glyph from the source (18px, 2.25 stroke). Rotated 45deg while the
 * row is closed (reads as a plus), straightens to an X when open. */
function XIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3.75 3.75L14.25 14.25M3.75 14.25L14.25 3.75"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Accordion row: transparent with ink text at rest, ink card with blush
 * text on hover and while open; the answer expands on the source's
 * spring(bounce .2, .4s). Rows toggle independently, as on the source. */
function FaqRow({ faq }: { faq: Faq }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const [open, setOpen] = useState(false);

  return (
    <div
      ref={ref}
      className={styles.row}
      data-in={inView ? "true" : undefined}
      data-open={open ? "true" : undefined}
    >
      <button
        type="button"
        className={styles.rowButton}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.rowHead}>
          <h3 className={styles.question}>{faq.question}</h3>
          <span className={styles.xBox}>
            <XIcon />
          </span>
        </span>
        <span className={styles.answerClip}>
          <span className={styles.answerInner}>
            <span className={styles.answer}>{faq.answer}</span>
          </span>
        </span>
      </button>
    </div>
  );
}

export default function Faq({
  eyebrow,
  heading,
  faqs,
  videoUrl,
}: Pick<FaqBlock, "eyebrow" | "heading" | "faqs" | "videoUrl">) {
  const [h2Ref, h2In] = useInView<HTMLHeadingElement>(0.5);

  return (
    <section className={styles.faq}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.headingBlock}>
            <div className={styles.tab}>
              <span className={styles.tabIcon}>
                <Image src={iconTabFaq} alt="" aria-hidden="true" />
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
          </div>

          <div className={styles.rows}>
            {faqs?.map((faq) => (
              <FaqRow key={faq._key} faq={faq} />
            ))}
          </div>
        </div>

        <div className={styles.videoCol}>
          <video
            className={styles.video}
            src={videoUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
          />
          <span className={styles.logo} aria-hidden="true">
            <Image src={rLogo} alt="" fill />
          </span>
        </div>
      </div>
    </section>
  );
}
