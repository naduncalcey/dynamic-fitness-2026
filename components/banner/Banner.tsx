"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import SanityImage from "@/components/shared/SanityImage";
import type { BannerBlock } from "@/sanity/blocks";

import styles from "./banner.module.css";

type BannerProps = Pick<BannerBlock, "image"> & {
  /** Resting translateY of the effect's first target — the fighter banner
   * uses 30, the later banners settle from scale alone. */
  rise?: number;
};

/** Full-viewport image banner — the source's sticky "Image" sections.
 *
 * The section pins to the viewport (sticky, z 3) so it slides up over the
 * previous section and the next one slides up over it. On every entry into
 * view the image settles from scale 1.2 (plus an optional y offset) to
 * identity on the source's spring (stiffness 200, damping 60, mass 1);
 * leaving view resets it, exactly as the source's transform effect replays. */
export default function Banner({ image, rise = 0 }: BannerProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={styles.banner}
      data-in={inView ? "true" : undefined}
      style={{ "--rise": `${rise}px` } as CSSProperties}
    >
      <div className={styles.zoom}>
        <SanityImage image={image} fill sizes="100vw" quality={90} useHotspot />
      </div>
    </section>
  );
}
