"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";

import styles from "./banner.module.css";

type BannerProps = {
  image: StaticImageData;
  alt: string;
  /** Resting translateY of the effect's first target — the fighter banner
   * uses 30, the later banners settle from scale alone. */
  rise?: number;
  /** object-position of the cover crop (source: fighter "50% 0%", rest
   * default center). */
  position?: string;
};

/** Full-viewport image banner — the source's sticky "Image" sections.
 *
 * The section pins to the viewport (sticky, z 3) so it slides up over the
 * previous section and the next one slides up over it. On every entry into
 * view the image settles from scale 1.2 (plus an optional y offset) to
 * identity on the source's spring (stiffness 200, damping 60, mass 1);
 * leaving view resets it, exactly as the source's transform effect replays. */
export default function Banner({
  image,
  alt,
  rise = 0,
  position = "50% 50%",
}: BannerProps) {
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
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          quality={90}
          placeholder="blur"
          style={{ objectPosition: position }}
        />
      </div>
    </section>
  );
}
