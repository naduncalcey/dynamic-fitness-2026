"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import iconTabFaq from "@/public/faq/icon-tab-faq.svg";
import rLogo from "@/public/faq/r-logo.svg";

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

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "Do I need any fitness experience to join?",
    a: "Not at all! We welcome complete beginners. Our Beginner Fitness Bootcamp is designed for people with zero experience. Your coach guides you through everything from day one.",
  },
  {
    q: "What should I bring to my first session?",
    a: "Just comfortable workout clothes, athletic shoes, a water bottle, and a towel. We provide all equipment needed during training.",
  },
  {
    q: "Are programs safe for kids and teens?",
    a: "Absolutely. Our Kids & Teens Camp is led by certified youth coaches trained in age-appropriate programming. All sessions are fully supervised.",
  },
  {
    q: "Can I book personal training sessions?",
    a: "Yes! We offer 1-on-1 personal training as part of our Advanced Performance program or as standalone sessions. Get in touch to book yours.",
  },
  {
    q: "How do I become a member of the club?",
    a: "Simply head to our Contact page, fill out the form, and one of our team members will reach out within 24 hours to get you set up. You can also walk into any of our locations during opening hours and we'll get you started on the spot.",
  },
  {
    q: "Can I do Group Classes and personal training at the same time?",
    a: "Absolutely, and we encourage it. Many of our members combine 2 to 3 Group Classes per week with 1 personal training session for an incredibly well-rounded approach to their fitness.",
  },
  {
    q: "Is there a joining fee or initiation cost?",
    a: "We keep it simple, no hidden fees, no surprises. There's a one-time enrollment fee of $49 which covers your initial fitness assessment, goal-setting session, and your Rep Republic welcome kit.",
  },
  {
    q: "Do you offer month-to-month or only annual contracts?",
    a: "We offer both. Our month-to-month membership gives you full flexibility, while our annual plan saves you up to 20%.",
  },
];

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
          <h3 className={styles.question}>{faq.q}</h3>
          <span className={styles.xBox}>
            <XIcon />
          </span>
        </span>
        <span className={styles.answerClip}>
          <span className={styles.answerInner}>
            <span className={styles.answer}>{faq.a}</span>
          </span>
        </span>
      </button>
    </div>
  );
}

export default function Faq() {
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
              <p className={styles.tabText}>FAQs</p>
            </div>

            <h2
              ref={h2Ref}
              className={styles.heading}
              data-in={h2In ? "true" : undefined}
            >
              {["Got", "Questions?"].map((word, i) => (
                <Fragment key={word}>
                  {i > 0 ? <br /> : null}
                  <span
                    className={styles.word}
                    style={{ "--wd": `${i * 50}ms` } as CSSProperties}
                  >
                    {word}
                  </span>
                </Fragment>
              ))}
            </h2>
          </div>

          <div className={styles.rows}>
            {FAQS.map((faq) => (
              <FaqRow key={faq.q} faq={faq} />
            ))}
          </div>
        </div>

        <div className={styles.videoCol}>
          <video
            className={styles.video}
            src="/faq/faq-video.mp4"
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
