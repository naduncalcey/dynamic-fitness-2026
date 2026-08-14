import Image from "next/image";

import arrowDown from "@/public/hero/arrow-down.svg";
import badge from "@/public/hero/badge.svg";
import ceoAvatar from "@/public/hero/ceo-avatar.jpg";
import heroBg from "@/public/hero/hero-bg.png";
import star from "@/public/hero/star.svg";

import styles from "./hero.module.css";

const STARS = [0, 1, 2, 3, 4];

/** Two-line staggered wordmark: DYNAMIC flush left, FITNESS(R) flush right.
 *
 * Each viewBox is a design canvas measured in the type's own units, so scaling
 * the SVG to the column scales the whole composition. The wide canvas leaves
 * room to the right of line 1 and to the left of line 2, which is what creates
 * the diagonal; the phone canvas is exactly line 1's width, so the type runs
 * edge to edge. See hero.module.css for the measured widths. */
function Wordmark() {
  const line2 = (
    <>
      Fitness<span className={styles.wmR}>®</span>
    </>
  );

  return (
    <h1 className={styles.wordmark} aria-label="Dynamic Fitness">
      <svg className={styles.wmWide} viewBox="0 0 888.58 85" aria-hidden="true">
        <foreignObject x="0" y="0" width="888.58" height="85">
          <div className={styles.wmLines}>
            <div className={styles.wmLine}>Dynamic {line2}</div>
          </div>
        </foreignObject>
      </svg>

      <svg
        className={styles.wmPhone}
        viewBox="0 0 444.19 156"
        aria-hidden="true"
      >
        <foreignObject x="0" y="0" width="444.19" height="156">
          <div className={styles.wmLines}>
            <div className={`${styles.wmLine} ${styles.wmPhoneL1}`}>
              Dynamic
            </div>
            <div
              className={`${styles.wmLine} ${styles.wmLineEnd} ${styles.wmPhoneL2}`}
            >
              {line2}
            </div>
          </div>
        </foreignObject>
      </svg>
    </h1>
  );
}

type ButtonProps = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
  /** Container class carrying the outer tween; the button springs separately. */
  riseClass: string;
};

/** Label sits in a one-line-tall clipped window; hover slides the track up so
 * the underlined copy takes its place. */
function HeroButton({ href, label, variant, riseClass }: ButtonProps) {
  return (
    <span className={`${styles.btnSlot} ${riseClass}`}>
      <a
        href={href}
        className={`${styles.btn} ${styles.aBtnInner} ${
          variant === "primary" ? styles.btnPrimary : styles.btnSecondary
        }`}
      >
        <span className={styles.btnLabel}>
          <span className={styles.btnTrack}>
            <span>{label}</span>
            <span aria-hidden="true">{label}</span>
          </span>
        </span>
      </a>
    </span>
  );
}

function Plus() {
  return <span className={styles.plus} />;
}

function Spacer() {
  return <span className={styles.plusSpacer} />;
}

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.frame}>
        <div className={styles.backdrop}>
          <Image
            src={heroBg}
            alt="Athlete resting between pull-up sets in a dimly lit gym"
            fill
            sizes="100vw"
            priority
            quality={90}
            placeholder="blur"
          />
        </div>

        <div className={styles.content}>
          <div className={styles.heading}>
            <Wordmark />

            <div className={`${styles.metaRow} ${styles.aMeta1}`}>
              <span className={styles.rating}>
                <span className={styles.stars}>
                  {STARS.map((i) => (
                    <span key={i} className={styles.starBox}>
                      <Image src={star} alt="" aria-hidden="true" />
                    </span>
                  ))}
                </span>
                <span>5 / 5</span>
              </span>
              <span>35 Certified Coaches</span>
            </div>

            <div className={`${styles.metaRow} ${styles.metaRowLast} ${styles.aMeta2}`}>
              <span>Best Rated Gym Club</span>
              <span>New York, NY | Miami, FL</span>
            </div>

            <a
              href="/contact"
              className={`${styles.ceoCard} ${styles.aCard}`}
            >
              <span className={styles.ceoAvatar}>
                <Image
                  src={ceoAvatar}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="64px"
                />
              </span>
              <span className={styles.ceoBody}>
                <span className={styles.ceoTitleRow}>
                  <span className={styles.ceoTitle}>Talk to CEO</span>
                  <Image
                    className={styles.ceoBadge}
                    src={badge}
                    alt=""
                    aria-hidden="true"
                    width={19}
                    height={19}
                  />
                </span>
                <span className={styles.ceoMeta}>
                  <span>Alicia J.</span>
                  <br />
                  <span>CEO, ACE-CPT</span>
                </span>
              </span>
            </a>
          </div>

          <div className={styles.body}>
            <p className={`${styles.tagline} ${styles.aTagline}`}>
              Built for people who want more than a gym membership. Expert
              coaching and a plan that works.
            </p>

            <div className={styles.actions}>
              <HeroButton
                href="/contact"
                label="Get Started"
                variant="primary"
                riseClass={styles.aBtn1}
              />
              <HeroButton
                href="/blog"
                label="Explore Blog"
                variant="secondary"
                riseClass={styles.aBtn2}
              />
            </div>

            <a
              href="#hero-next"
              className={`${styles.scrollCue} ${styles.aArrow}`}
              aria-label="Scroll to next section"
            >
              <span className={styles.scrollCueInner}>
                <Image src={arrowDown} alt="" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </div>

      <span className={`${styles.detail} ${styles.detail1}`} aria-hidden="true">
        <Plus />
        <Spacer />
      </span>
      <span className={`${styles.detail} ${styles.detail2}`} aria-hidden="true">
        <Spacer />
        <Plus />
      </span>
      <span className={`${styles.detail} ${styles.detail3}`} aria-hidden="true">
        <Plus />
        <Spacer />
      </span>
    </section>
  );
}
