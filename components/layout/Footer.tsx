"use client";

import { useRef, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { getLocaleFromPathname, localizeHref } from "@/lib/i18n/locale";

/**
 * Global site footer, recreated from the previous Dynamic Fitness site: brand
 * column + three link groups, a "START NOW //" spotlight CTA, the giant gradient
 * "DYNAMIC" wordmark, and a status bar. Static layout chrome; rendered once in
 * app/layout.tsx.
 */

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

// Footer links point at real destinations only (no dead `#` placeholders): the
// gym's services don't have dedicated pages yet, so they anchor to the most
// relevant home section (#pricing lists what each plan includes, #about
// describes the gym), FAQs jump to the FAQ accordion, and Contact opens email.
const linkGroups = [
  {
    titleKey: "footer.group.services",
    links: [
      { labelKey: "footer.link.personalTraining", href: "/#pricing" },
      { labelKey: "footer.link.hiitClasses", href: "/#pricing" },
      { labelKey: "footer.link.pricing", href: "/#pricing" },
    ],
  },
  {
    titleKey: "footer.group.resources",
    links: [
      // FitConnect partner app — same URL as the logo carousel (Hero/LogoScroll).
      { labelKey: "footer.link.fitconnect", href: "https://fitconnect.me" },
      { labelKey: "footer.link.classSchedule", href: "/#pricing" },
      { labelKey: "footer.link.faqs", href: "/#faq" },
    ],
  },
  {
    titleKey: "footer.group.company",
    links: [
      { labelKey: "footer.link.about", href: "/#about" },
      { labelKey: "footer.link.careers", href: "/careers" },
      { labelKey: "footer.link.blog", href: "/blog" },
      { labelKey: "footer.link.contact", href: "/contact" },
    ],
  },
];

// Public contact details (mirrors the structured data in lib/seo.ts).
const CONTACT_EMAIL = "admin@dynamicfitness.lk";
const CONTACT_PHONE_DISPLAY = "+94 77 240 3117";
const CONTACT_PHONE_HREF = "tel:+94772403117";
const INSTAGRAM_URL = "https://www.instagram.com/dynamicfitness.lk";
const WHATSAPP_URL = "https://wa.me/94772403117";

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.74c0 4.47-3.64 8.11-8.11 8.11-1.53 0-3.02-.43-4.32-1.23l-.31-.18-3.21.84.86-3.13-.2-.32a8.05 8.05 0 0 1-1.24-4.29c0-4.47 3.64-8.11 8.11-8.11zm-3.6 4.27c-.17 0-.45.06-.69.31-.24.25-.91.89-.91 2.17 0 1.28.93 2.51 1.06 2.69.13.17 1.83 2.79 4.49 3.91.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.08 1.56-.64 1.78-1.25.22-.61.22-1.14.16-1.25-.07-.11-.24-.17-.51-.31-.27-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.59.14-.17.27-.68.86-.83 1.03-.15.17-.31.2-.57.07-.27-.14-1.13-.42-2.16-1.33-.8-.71-1.34-1.59-1.49-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.17-.27.26-.45.09-.18.04-.34-.02-.48-.07-.14-.59-1.43-.81-1.96-.21-.51-.43-.44-.59-.45h-.5z" />
    </svg>
  );
}

const CTA_LINK = "https://calendly.com/nadun-n-dynamicfitness/30min";
const BRAND_TEXT = "DYNAMIC";
// Postal address stays in English (proper nouns) regardless of locale.
const ADDRESS_LINES = [
  "Dynamic Fitness (Pvt) Ltd.",
  "14 Dewananada Road,",
  "Nawinna,",
  "Maharagama",
];

const RED_BEAM =
  "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,120,120,0.25) 0%, rgba(255,80,80,0.1) 20%, rgba(0,0,0,0) 55%)";

export function Footer() {
  const t = useLabels();
  const current = getLocaleFromPathname(usePathname() ?? "/");
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ctaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <footer className="w-full border-y border-white/20 bg-black text-white">
      {/* Top section */}
      <div className={`pt-[60px] pb-10 md:pt-[80px] md:pb-14 lg:border-x lg:border-white/20 ${CONTAINER}`}>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand column */}
          <div>
            <a href={localizeHref("/", current)} aria-label="Dynamic Fitness">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Dynamic Fitness" className="h-8 w-auto" />
            </a>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-gray-400">{t("footer.tagline")}</p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-gray-400">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 block transition-colors hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
              <a href={CONTACT_PHONE_HREF} className="block transition-colors hover:text-white">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </address>

            {/* Social / messaging */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dynamic Fitness on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <InstagramIcon />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Dynamic Fitness on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <WhatsAppIcon />
              </a>
            </div>

            <a
              href="https://ebadge.bestweb.lk/api/v1/clicked/dynamicfitness.lk/BestWeb/2025/Rate_Us"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://ebadge.bestweb.lk/eBadgeSystem/domainNames/dynamicfitness.lk/BestWeb/2025/Rate_Us/image.png"
                alt="BestWeb 2025"
                width={60}
                height={60}
              />
            </a>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.titleKey}>
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
                {t(group.titleKey)}
              </p>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => {
                  const isExternal = /^https?:/i.test(link.href);
                  return (
                    <li key={link.labelKey}>
                      <a
                        href={localizeHref(link.href, current)}
                        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                        className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                      >
                        {t(link.labelKey)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <a
            ref={ctaRef}
            href={CTA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            className="group/cta relative inline-flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border bg-[var(--cta-surface)] px-8 py-[0.9rem] text-sm uppercase tracking-[0.12em] text-[var(--cta-text)] backdrop-blur-md transition-colors duration-300 hover:text-[var(--cta-text-hover)]"
            style={{ borderColor: "var(--cta-red-border)" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[350ms] ease-out group-hover/cta:opacity-100"
              style={{ background: RED_BEAM }}
            />
            <span className="pointer-events-none relative flex items-center gap-3">
              <span className="text-xs tracking-[0.15em] text-red-400">{t("footer.cta.prefix")}</span>
              {t("footer.cta.text")}
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* Large brand text */}
      <div className={`overflow-hidden border-t border-white/10 py-8 md:py-10 lg:border-x lg:border-white/20 ${CONTAINER}`}>
        <p
          className="select-none text-center text-[80px] font-bold leading-none tracking-tighter sm:text-[120px] md:text-[160px] lg:text-[200px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.03) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {BRAND_TEXT}
        </p>
      </div>

      {/* Bottom bar */}
      <div className={`border-t border-white/10 py-5 md:py-6 lg:border-x lg:border-white/20 ${CONTAINER}`}>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
              {t("footer.hours")}
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
            <a href={localizeHref("/privacy-policy", current)} className="transition-colors hover:text-white">
              {t("footer.legal.privacy")}
            </a>
            <a href={localizeHref("/terms", current)} className="transition-colors hover:text-white">
              {t("footer.legal.terms")}
            </a>
            <a href={localizeHref("/cookie-policy", current)} className="transition-colors hover:text-white">
              {t("footer.legal.cookies")}
            </a>
            <span>© 2026 Dynamic Fitness</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
