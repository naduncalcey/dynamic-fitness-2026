"use client";

import { useRef, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { getLocaleFromPathname, localizeHref } from "@/lib/i18n/locale";
import { SkeletonImage } from "@/components/common/SkeletonImage";
import { ScheduleModal } from "@/components/layout/ScheduleModal";
import { ArrowRight, MessageCircle } from "lucide-react";

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
// "Time Schedule" is the exception — instead of navigating, it opens the
// opening-hours popup (ScheduleModal), kept entirely in the frontend.
type FooterLink =
  | { labelKey: string; href: string } // label from the Contentful uiLabel set
  | { label: string; href: string } // label hardcoded in the frontend
  | { label: string; action: "schedule" }; // opens the opening-hours popup

type FooterLinkGroup = { titleKey: string; links: FooterLink[] };

const linkGroups: FooterLinkGroup[] = [
  {
    titleKey: "footer.group.services",
    links: [
      { labelKey: "footer.link.personalTraining", href: "/#pricing" },
      // Amenities page — a Contentful FlexiblePage at /services/amenities. Label
      // kept in the frontend (the footer.link.hiitClasses uiLabel is now unused).
      { label: "Amenities", href: "/services/amenities" },
      { labelKey: "footer.link.pricing", href: "/#pricing" },
    ],
  },
  {
    titleKey: "footer.group.resources",
    links: [
      // FitConnect partner app — same URL as the logo carousel (Hero/LogoScroll).
      { labelKey: "footer.link.fitconnect", href: "https://fitconnect.me" },
      // Opening-hours popup; label and hours live in the frontend, not Contentful.
      { label: "Time Schedule", action: "schedule" },
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
const CONTACT_EMAIL = "nadun.n@dynamicfitness.lk";
const CONTACT_PHONE_DISPLAY = "+94 77 240 3117";
const CONTACT_PHONE_HREF = "tel:+94772403117";
const INSTAGRAM_URL = "https://www.instagram.com/dynamicfitness.lk";
const WHATSAPP_URL = "https://wa.me/94772403117";

// Instagram stays an inline SVG: lucide-react intentionally omits trademarked
// brand marks (no Instagram icon). WhatsApp uses Lucide's MessageCircle, the
// conventional substitute since Lucide ships no WhatsApp mark either.
function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
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
  const [scheduleOpen, setScheduleOpen] = useState(false);

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
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </a>
            </div>

            <a
              href="https://ebadge.bestweb.lk/api/v1/clicked/dynamicfitness.lk/BestWeb/2025/Rate_Us"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              <SkeletonImage
                kind="plain"
                wrapperClassName="h-20 w-14"
                src="https://ebadge.bestweb.lk/eBadgeSystem/domainNames/dynamicfitness.lk/BestWeb/2025/Rate_Us/image.png"
                alt="BestWeb 2025"
                className="h-full w-full object-contain"
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
                  if ("action" in link) {
                    return (
                      <li key={link.action}>
                        <button
                          type="button"
                          onClick={() => setScheduleOpen(true)}
                          className="cursor-pointer text-left text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                        >
                          {link.label}
                        </button>
                      </li>
                    );
                  }
                  const isExternal = /^https?:/i.test(link.href);
                  const label = "labelKey" in link ? t(link.labelKey) : link.label;
                  return (
                    <li key={"labelKey" in link ? link.labelKey : link.href}>
                      <a
                        href={localizeHref(link.href, current)}
                        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                        className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                      >
                        {label}
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
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
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

      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </footer>
  );
}

export default Footer;
