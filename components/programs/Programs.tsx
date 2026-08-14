"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import OrangeTicker from "@/components/ticker/OrangeTicker";
import ceoAvatar from "@/public/programs/ceo-avatar.jpg";
import iconAskArrow from "@/public/programs/icon-ask-arrow.svg";
import iconStar from "@/public/programs/icon-star.svg";
import iconTabDumbbell from "@/public/programs/icon-tab-dumbbell.svg";

import styles from "./programs.module.css";

/** Once-only in-view trigger, mirroring the source's per-element appear
 * observers (fades fire on first pixel, word effects at 50%). */
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

/** Generic once-only reveal wrapper: sets data-in when it enters view. */
function Reveal({
  className,
  children,
  threshold = 0,
  as = "div",
}: {
  className: string;
  children: ReactNode;
  threshold?: number;
  as?: "div" | "p" | "span";
}) {
  const [ref, inView] = useInView<HTMLElement>(threshold);
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      data-in={inView ? "true" : undefined}
    >
      {children}
    </Tag>
  );
}

const STARS = [0, 1, 2, 3, 4];

type Program = {
  n: string;
  title: string;
  copy: string;
  meta: string;
  trusted: string;
};

const PROGRAMS: Program[] = [
  {
    n: "01",
    title: "Beginner Fitness Bootcamp",
    copy: "Learn proper form, master basics, and build a strong foundation to confidently begin your fitness journey.",
    meta: "4 Weeks · Equipment Provided",
    trusted: "Trusted by 310+ members",
  },
  {
    n: "02",
    title: "Strength & Conditioning",
    copy: "Refine technique, increase strength, and unlock greater power with progressive training built to level you up.",
    meta: "6 Weeks · Equipment Provided",
    trusted: "Trusted by 245+ members",
  },
  {
    n: "03",
    title: "Advanced Training",
    copy: "Train like an athlete with focused programming designed to boost speed, strength, and peak performance.",
    meta: "1-on-1 Coaching · Custom Plan",
    trusted: "Trusted by 180+ members",
  },
  {
    n: "04",
    title: "Weight Loss Program",
    copy: "Burn fat effectively with structured workouts and practical nutrition guidance built for lasting results.",
    meta: "8 Weeks · Nutrition Plan Included",
    trusted: "Trusted by 120+ members",
  },
  {
    n: "05",
    title: "Group Classes",
    copy: "Join high-energy, coach-led sessions that build strength, endurance, and consistency in a motivating setting.",
    meta: "Daily Classes · All Levels Welcome",
    trusted: "Trusted by 430+ members",
  },
];

/** Sticky-stacked program card. The wrapper pins at a staggered offset
 * (120px + 70px per card on desktop) so cards pile up as you scroll. */
function ProgramCard({ program, index }: { program: Program; index: number }) {
  return (
    <div
      className={styles.cardWrap}
      style={{ "--i": index } as CSSProperties}
    >
      <article
        className={`${styles.card} ${index % 2 === 1 ? styles.cardAlt : ""}`}
      >
        <span className={styles.cardTexture} aria-hidden="true" />

        <p className={styles.cardTime}>{program.n}</p>

        <div className={styles.topic}>
          <h3 className={styles.cardTitle}>{program.title}</h3>
          <Reveal as="p" className={styles.cardCopy}>
            {program.copy}
          </Reveal>
          <Reveal as="p" className={styles.cardMeta}>
            {program.meta}
          </Reveal>
        </div>

        <div className={styles.cardFoot}>
          <span className={styles.cardDivider} aria-hidden="true" />
          <div className={styles.cardRow}>
            <div className={styles.ratings}>
              <span className={styles.stars}>
                {STARS.map((i) => (
                  <span key={i} className={styles.star}>
                    <Image src={iconStar} alt="" aria-hidden="true" />
                  </span>
                ))}
              </span>
              <p className={styles.trusted}>{program.trusted}</p>
            </div>

            <Reveal as="span" className={styles.enrollSlot}>
              <a href="/contact" className={styles.enroll}>
                <span className={styles.enrollLabel}>
                  <span className={styles.enrollTrack}>
                    <span>Enroll Now</span>
                    <span aria-hidden="true">Enroll Now</span>
                  </span>
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function Programs() {
  const [h2Ref, h2In] = useInView<HTMLHeadingElement>(0.5);

  return (
    <section className={styles.programs}>
      <OrangeTicker />

      <div className={styles.container}>
        <div className={styles.headingCol}>
          <div className={styles.headingBlock}>
            <div className={styles.tab}>
              <span className={styles.tabIcon}>
                <Image src={iconTabDumbbell} alt="" aria-hidden="true" />
              </span>
              <p className={styles.tabText}>Programs</p>
            </div>

            <h2
              ref={h2Ref}
              className={styles.heading}
              data-in={h2In ? "true" : undefined}
            >
              {["Find", "Your", "Program"].map((word, i) => (
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

            <Reveal as="p" className={styles.subcopy}>
              Inspire every member to reach their full potential through
              smart, safe, and high-energy training.
            </Reveal>
          </div>

          <Reveal as="span" className={styles.askSlot}>
            <a href="/contact" className={styles.askCeo}>
              <span className={styles.askAvatar}>
                <Image src={ceoAvatar} alt="" aria-hidden="true" fill sizes="64px" />
              </span>
              <span className={styles.askContent}>
                <span className={styles.askHeadRow}>
                  <span className={styles.askTitle}>Ask CEO</span>
                  <span className={styles.askIcon} aria-hidden="true">
                    <span className={styles.askIconTrack}>
                      <Image src={iconAskArrow} alt="" />
                      <Image src={iconAskArrow} alt="" />
                    </span>
                  </span>
                </span>
                <span className={styles.askMeta}>
                  <span>Alicia J.</span>
                  <br />
                  <span>CEO, ACE-CPT</span>
                </span>
              </span>
            </a>
          </Reveal>
        </div>

        <div className={styles.sessions}>
          {PROGRAMS.map((program, i) => (
            <ProgramCard key={program.n} program={program} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
