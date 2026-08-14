"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { StaticImageData } from "next/image";

import statImg1 from "@/public/numbers/stat-img-1.png";
import statImg2 from "@/public/numbers/stat-img-2.webp";
import statImg3 from "@/public/numbers/stat-img-3.webp";

import styles from "./numbers.module.css";

/** Source ticker config: 50px/s leftward, gap 0, slows to 0.6x while
 * hovered, pauses when off screen or the tab is hidden. */
const SPEED = 50;
const HOVER_FACTOR = 0.6;

/** Counter spring: the source counts 0 -> N with spring(bounce 0, duration
 * 1s) — critically damped, solved so the residual is 0.1% at 1s. */
const COUNTER_W0 = 9.2334;
const COUNTER_MS = 1000;

type Stat = { value: number; suffix: string; label: string };

const STATS: [Stat, StaticImageData][] = [
  [{ value: 35, suffix: "+", label: "Certified Coaches" }, statImg1],
  [{ value: 427, suffix: "+", label: "Members Trained" }, statImg2],
  [{ value: 7, suffix: "+", label: "Registered Gyms" }, statImg3],
];

/** Count-up number. A ghost copy of the final value reserves the layout box
 * (the source's `balance` option) while the animated copy sits on top. */
function Counter({ value, suffix, run }: Stat & { run: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!run || !el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${value}${suffix}`;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / COUNTER_MS;
      const x = t >= 1 ? 1 : 1 - Math.exp(-COUNTER_W0 * t) * (1 + COUNTER_W0 * t);
      el.textContent = `${Math.round(value * x)}${suffix}`;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value, suffix]);

  return (
    <div className={styles.statNum}>
      <span className={styles.statNumGhost} aria-hidden="true">
        {value}
        {suffix}
      </span>
      <h3 ref={ref} className={styles.statNumLive}>
        0{suffix}
      </h3>
    </div>
  );
}

function TickerSet({
  run,
  hidden,
  setRef,
}: {
  run: boolean;
  hidden: boolean;
  setRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className={styles.set} ref={setRef} aria-hidden={hidden || undefined}>
      {STATS.map(([stat, img], i) => (
        <div className={styles.pair} key={i}>
          <div className={styles.stat}>
            <span className={styles.statTexture} aria-hidden="true" />
            <Counter {...stat} run={run} />
            <p className={styles.statLabel}>{stat.label}</p>
            <span className={styles.statLine} aria-hidden="true" />
          </div>
          <div className={styles.photo}>
            <Image src={img} alt="" aria-hidden="true" fill sizes="268px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stats carousel under the About section — the source's "Numbers" ticker.
 * Hidden below 768px. */
export default function Numbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setElRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const inViewRef = useRef(false);
  const [run, setRun] = useState(false);

  // Marquee: the same WAAPI animation the source builds — one set-width per
  // loop at 50px/s, linear, infinite. playbackRate carries the hover slowdown.
  useEffect(() => {
    const track = trackRef.current;
    const set = setElRef.current;
    if (!track || !set) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const syncPlayState = () => {
      const anim = animRef.current;
      if (!anim) return;
      if (inViewRef.current && !document.hidden) anim.play();
      else anim.pause();
    };

    // (Re)build whenever the set's width changes — including 0 -> 1608 when
    // the section un-hides as the viewport crosses the 768px cutoff.
    const build = () => {
      const w = set.offsetWidth;
      animRef.current?.cancel();
      animRef.current = null;
      if (!w) return;
      const anim = track.animate(
        [{ transform: "translateX(0)" }, { transform: `translateX(-${w}px)` }],
        { duration: (w / SPEED) * 1000, iterations: Infinity, easing: "linear" },
      );
      anim.pause(); // resumes when the section scrolls into view
      animRef.current = anim;
      syncPlayState();
    };
    build();

    const ro = new ResizeObserver(build);
    ro.observe(set);
    document.addEventListener("visibilitychange", syncPlayState);

    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting) setRun(true); // counters + label fades, once
      syncPlayState();
    });
    if (sectionRef.current) io.observe(sectionRef.current);

    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", syncPlayState);
      io.disconnect();
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, []);

  const setRate = (rate: number) => {
    if (animRef.current) animRef.current.playbackRate = rate;
  };

  return (
    <section
      ref={sectionRef}
      className={styles.numbers}
      data-in={run ? "true" : undefined}
    >
      <div
        className={styles.viewport}
        onMouseEnter={() => setRate(HOVER_FACTOR)}
        onMouseLeave={() => setRate(1)}
      >
        <div ref={trackRef} className={styles.track}>
          {[0, 1, 2, 3].map((i) => (
            <TickerSet
              key={i}
              run={run}
              hidden={i > 0}
              setRef={i === 0 ? setElRef : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
