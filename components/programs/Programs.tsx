"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import HeadingWords from "@/components/shared/HeadingWords";
import SanityImage from "@/components/shared/SanityImage";
import OrangeTicker from "@/components/ticker/OrangeTicker";
import iconAskArrow from "@/public/programs/icon-ask-arrow.svg";
import iconStar from "@/public/programs/icon-star.svg";
import iconTabDumbbell from "@/public/programs/icon-tab-dumbbell.svg";
import type { ProgramsBlock } from "@/sanity/blocks";

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

type Program = NonNullable<ProgramsBlock["programs"]>[number];

/** Sticky-stacked program card. The wrapper pins at a staggered offset
 * (120px + 70px per card on desktop) so cards pile up as you scroll. */
function ProgramCard({
  program,
  index,
  instant = false,
}: {
  program: Program;
  index: number;
  /** Skip the scroll-in reveal for cards the toggle swapped in mid-view. */
  instant?: boolean;
}) {
  return (
    <div
      className={`${styles.cardWrap} ${instant ? styles.instant : ""}`}
      style={{ "--i": index } as CSSProperties}
    >
      <article
        className={`${styles.card} ${index % 2 === 1 ? styles.cardAlt : ""}`}
      >
        <span className={styles.cardTexture} aria-hidden="true" />

        <p className={styles.cardTime}>
          {String(index + 1).padStart(2, "0")}
        </p>

        <div className={styles.topic}>
          {program.eyebrow ? (
            <Reveal as="p" className={styles.cardEyebrow}>
              {program.eyebrow}
            </Reveal>
          ) : null}
          <h3 className={styles.cardTitle}>{program.title}</h3>
          <Reveal as="p" className={styles.cardCopy}>
            {program.description}
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
              <p className={styles.trusted}>{program.trustedLabel}</p>
            </div>

            {program.cta ? (
              <Reveal as="span" className={styles.enrollSlot}>
                <a href={program.cta.href ?? "#"} className={styles.enroll}>
                  <span className={styles.enrollLabel}>
                    <span className={styles.enrollTrack}>
                      <span>{program.cta.label}</span>
                      <span aria-hidden="true">{program.cta.label}</span>
                    </span>
                  </span>
                </a>
              </Reveal>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}

type Audience = "individual" | "couple";

export default function Programs({
  eyebrow,
  heading,
  subcopy,
  audienceToggle,
  contactCard,
  programs,
}: Pick<
  ProgramsBlock,
  | "eyebrow"
  | "heading"
  | "subcopy"
  | "audienceToggle"
  | "contactCard"
  | "programs"
>) {
  const [h2Ref, h2In] = useInView<HTMLHeadingElement>(0.5);
  const [audience, setAudience] = useState<Audience>("individual");
  // Once the toggle is used, cards appear mid-view rather than on scroll, so
  // they should render settled instead of replaying the reveal.
  const [switched, setSwitched] = useState(false);

  const all = programs ?? [];
  // Cards authored before the audience field existed default to individual.
  const forAudience = (value: Audience) =>
    all.filter((p) => (p.audience ?? "individual") === value);

  const individual = forAudience("individual");
  const couple = forAudience("couple");

  // A one-sided toggle is just noise, so it only shows when both sides exist.
  const showToggle = individual.length > 0 && couple.length > 0;
  const visible = showToggle
    ? audience === "couple"
      ? couple
      : individual
    : all;

  const options: { value: Audience; label: string }[] = [
    { value: "individual", label: audienceToggle?.individualLabel ?? "Individual" },
    { value: "couple", label: audienceToggle?.coupleLabel ?? "Couple" },
  ];

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
              <p className={styles.tabText}>{eyebrow}</p>
            </div>

            <h2
              ref={h2Ref}
              className={styles.heading}
              data-in={h2In ? "true" : undefined}
            >
              <HeadingWords text={heading} wordClass={styles.word} />
            </h2>

            <Reveal as="p" className={styles.subcopy}>
              {subcopy}
            </Reveal>
          </div>

          {showToggle ? (
            <div
              className={styles.audienceToggle}
              role="group"
              aria-label="Membership type"
              style={
                {
                  "--tg-count": options.length,
                  "--tg-active": options.findIndex(
                    (option) => option.value === audience,
                  ),
                } as CSSProperties
              }
            >
              <span className={styles.audienceThumb} aria-hidden="true" />
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.audienceOption}
                  aria-pressed={audience === option.value}
                  onClick={() => {
                    setAudience(option.value);
                    setSwitched(true);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {contactCard ? (
            <Reveal as="span" className={styles.askSlot}>
              <a href={contactCard.href ?? "#"} className={styles.askCeo}>
                <span className={styles.askAvatar}>
                  <SanityImage
                    image={contactCard.avatar}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="64px"
                  />
                </span>
                <span className={styles.askContent}>
                  <span className={styles.askHeadRow}>
                    <span className={styles.askTitle}>{contactCard.title}</span>
                    <span className={styles.askIcon} aria-hidden="true">
                      <span className={styles.askIconTrack}>
                        <Image src={iconAskArrow} alt="" />
                        <Image src={iconAskArrow} alt="" />
                      </span>
                    </span>
                  </span>
                  <span className={styles.askMeta}>
                    <span>{contactCard.personName}</span>
                    <br />
                    <span>{contactCard.personRole}</span>
                  </span>
                </span>
              </a>
            </Reveal>
          ) : null}
        </div>

        <div className={styles.sessions}>
          {visible.map((program, i) => (
            <ProgramCard
              key={program._key}
              program={program}
              index={i}
              instant={switched}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
