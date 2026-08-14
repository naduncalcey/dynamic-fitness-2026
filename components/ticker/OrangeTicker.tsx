"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import iconBoxing from "@/public/about/icon-boxing.svg";
import iconDumbbell from "@/public/about/icon-dumbbell.svg";
import iconThunder from "@/public/about/icon-thunder.svg";

import styles from "./orange-ticker.module.css";

/** The source ticker moves at 100px/s (its Speed prop is left at the default
 * 100), so the loop duration is one set's width divided by that. */
const TICKER_SPEED = 100;

/** Orange marquee bar used between sections. Four copies of the item set
 * scroll left one set-width per loop; duration is measured off the DOM so the
 * speed stays exactly 100px/s whatever the font renders at. Runs only while
 * on screen, exactly like the source. */
export default function OrangeTicker() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    const set = setRef.current;
    if (!track || !set) return;
    const update = () =>
      track.style.setProperty(
        "--ticker-dur",
        `${set.offsetWidth / TICKER_SPEED}s`,
      );
    update();
    const ro = new ResizeObserver(update);
    ro.observe(set);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setPaused(!entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = (
    <>
      <span className={`${styles.tickerIcon} ${styles.icoBoxing}`}>
        <Image src={iconBoxing} alt="" aria-hidden="true" />
      </span>
      <span className={styles.tickerText}>PUSH YOUR LIMITS</span>
      <span className={`${styles.tickerIcon} ${styles.icoThunder}`}>
        <Image src={iconThunder} alt="" aria-hidden="true" />
      </span>
      <span className={styles.tickerText}>
        {"SHOW UP   •   LIFT   •   REPEAT"}
      </span>
      <span className={`${styles.tickerIcon} ${styles.icoDumbbell}`}>
        <Image src={iconDumbbell} alt="" aria-hidden="true" />
      </span>
      <span className={styles.tickerText}>JOIN THE REPUBLIC</span>
    </>
  );

  return (
    <div ref={wrapRef} className={styles.ticker} data-paused={paused}>
      <div ref={trackRef} className={styles.tickerTrack}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            ref={i === 0 ? setRef : undefined}
            className={styles.tickerSet}
            aria-hidden={i > 0 || undefined}
          >
            {items}
          </div>
        ))}
      </div>
    </div>
  );
}
