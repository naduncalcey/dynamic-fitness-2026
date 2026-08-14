"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import HeadingWords from "@/components/shared/HeadingWords";
import OrangeTicker from "@/components/ticker/OrangeTicker";
import iconDumbbellHeading from "@/public/about/icon-dumbbell-heading.svg";
import iconTarget from "@/public/about/icon-target.svg";
import type { AboutBlock } from "@/sanity/blocks";

import styles from "./about.module.css";

/** Once-only in-view trigger, mirroring the source's per-element appear
 * observers (row/copy/button fire on first pixel, word effects at 50%). */
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

type CopyBlock = NonNullable<AboutBlock["blocks"]>[number];

/** The schema's icon values map to the glyph and its sizing class. */
const ICONS = {
  dumbbell: [iconDumbbellHeading, "icoDumbbellHead"],
  target: [iconTarget, "icoTarget"],
} as const;

/** "Who We Are" / "What Drives Us" block: word-by-word title reveal at 50%
 * visibility (500ms head start, 50ms stagger), copy fades on first pixel. */
function AboutBlock({ block }: { block: CopyBlock }) {
  const [headRef, headIn] = useInView<HTMLDivElement>(0.5);
  const [copyRef, copyIn] = useInView<HTMLParagraphElement>(0);
  const [icon, iconClass] = ICONS[block.icon as keyof typeof ICONS] ?? [];

  return (
    <div className={styles.block}>
      <div
        ref={headRef}
        className={styles.blockHead}
        data-in={headIn ? "true" : undefined}
        style={{ "--wbase": "500ms" } as CSSProperties}
      >
        <span className={`${styles.blockIcon} ${styles[iconClass]}`}>
          {icon ? <Image src={icon} alt="" aria-hidden="true" /> : null}
        </span>
        <h4 className={styles.blockTitle}>
          <HeadingWords text={block.title} wordClass={styles.word} />
        </h4>
      </div>
      <p
        ref={copyRef}
        className={styles.blockCopy}
        data-in={copyIn ? "true" : undefined}
      >
        {block.copy}
      </p>
    </div>
  );
}

export default function About({
  heading,
  blocks,
  cta,
  videoUrl,
}: Pick<AboutBlock, "heading" | "blocks" | "cta" | "videoUrl">) {
  const [rowRef, rowIn] = useInView<HTMLDivElement>(0);
  const [h2Ref, h2In] = useInView<HTMLHeadingElement>(0.5);
  const [btnRef, btnIn] = useInView<HTMLSpanElement>(0);

  return (
    <section className={styles.about}>
      <OrangeTicker />

      <div className={styles.container}>
        <div
          ref={rowRef}
          className={styles.row}
          data-in={rowIn ? "true" : undefined}
        >
          <div className={styles.content}>
            <h2
              ref={h2Ref}
              className={styles.heading}
              data-in={h2In ? "true" : undefined}
            >
              <HeadingWords
                text={heading}
                wordClass={styles.word}
                accentClass={styles.hRed}
                accentFirstLine
              />
            </h2>

            <div className={styles.blocks}>
              <span className={styles.divider} aria-hidden="true" />

              {blocks?.map((block) => (
                <Fragment key={block._key}>
                  <AboutBlock block={block} />
                  <span className={styles.divider} aria-hidden="true" />
                </Fragment>
              ))}

              {cta ? (
                <span
                  ref={btnRef}
                  className={styles.btnSlot}
                  data-in={btnIn ? "true" : undefined}
                >
                  <a href={cta.href ?? "#"} className={styles.btn}>
                    <span className={styles.btnLabel}>
                      <span className={styles.btnTrack}>
                        <span>{cta.label}</span>
                        <span aria-hidden="true">{cta.label}</span>
                      </span>
                    </span>
                  </a>
                </span>
              ) : null}
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
          </div>
        </div>
      </div>
    </section>
  );
}
