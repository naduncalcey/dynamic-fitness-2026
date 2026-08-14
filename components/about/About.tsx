"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import OrangeTicker from "@/components/ticker/OrangeTicker";
import iconDumbbellHeading from "@/public/about/icon-dumbbell-heading.svg";
import iconTarget from "@/public/about/icon-target.svg";

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

type BlockProps = {
  icon: typeof iconTarget;
  iconClass: string;
  title: string;
  copy: string;
};

/** "Who We Are" / "What Drives Us" block: word-by-word title reveal at 50%
 * visibility (500ms head start, 50ms stagger), copy fades on first pixel. */
function AboutBlock({ icon, iconClass, title, copy }: BlockProps) {
  const [headRef, headIn] = useInView<HTMLDivElement>(0.5);
  const [copyRef, copyIn] = useInView<HTMLParagraphElement>(0);

  return (
    <div className={styles.block}>
      <div
        ref={headRef}
        className={styles.blockHead}
        data-in={headIn ? "true" : undefined}
        style={{ "--wbase": "500ms" } as CSSProperties}
      >
        <span className={`${styles.blockIcon} ${iconClass}`}>
          <Image src={icon} alt="" aria-hidden="true" />
        </span>
        <h4 className={styles.blockTitle}>
          {title.split(" ").map((word, i) => (
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
      </div>
      <p
        ref={copyRef}
        className={styles.blockCopy}
        data-in={copyIn ? "true" : undefined}
      >
        {copy}
      </p>
    </div>
  );
}

export default function About() {
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
              <span
                className={`${styles.word} ${styles.hRed}`}
                style={{ "--wd": "0ms" } as CSSProperties}
              >
                Experience
              </span>
              <br />
              <span
                className={styles.word}
                style={{ "--wd": "50ms" } as CSSProperties}
              >
                Dynamic
              </span>
              <span
                className={`${styles.word} ${styles.hRed}`}
                style={{ "--wd": "100ms" } as CSSProperties}
              >
                &reg;
              </span>{" "}
              <span
                className={styles.word}
                style={{ "--wd": "150ms" } as CSSProperties}
              >
                Fitness
              </span>
            </h2>

            <div className={styles.blocks}>
              <span className={styles.divider} aria-hidden="true" />

              <AboutBlock
                icon={iconDumbbellHeading}
                iconClass={styles.icoDumbbellHead}
                title="Who We Are"
                copy="We’re a high-performance fitness club focused on building strength, endurance, and a strong community. Our goal is to create impactful training experiences for individuals at every stage."
              />

              <span className={styles.divider} aria-hidden="true" />

              <AboutBlock
                icon={iconTarget}
                iconClass={styles.icoTarget}
                title="What Drives Us"
                copy="We aim to support every member, from beginners to advanced athletes, in pushing their boundaries and achieving more than they thought possible."
              />

              <span className={styles.divider} aria-hidden="true" />

              <span
                ref={btnRef}
                className={styles.btnSlot}
                data-in={btnIn ? "true" : undefined}
              >
                <a href="/about" className={styles.btn}>
                  <span className={styles.btnLabel}>
                    <span className={styles.btnTrack}>
                      <span>Learn More</span>
                      <span aria-hidden="true">Learn More</span>
                    </span>
                  </span>
                </a>
              </span>
            </div>
          </div>

          <div className={styles.videoCol}>
            <video
              className={styles.video}
              src="/about/about-video.webm"
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
