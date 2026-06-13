"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LOCALE_MAP,
  getLocaleFromPathname,
  localizeHref,
  switchLocalePath,
  type LocaleConfig,
} from "@/lib/i18n/locale";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { Globe, ChevronDown } from "lucide-react";

/**
 * Global site header, recreated from the previous Dynamic Fitness site: logo on
 * the left, nav links + language switcher on the right (desktop), and an
 * animated hamburger that opens a full-screen overlay menu on mobile. Non-sticky.
 * Static layout chrome; rendered once in app/layout.tsx.
 *
 * Desktop nav links are 16px (text-base) per request.
 */

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

const navLinks = [
  { labelKey: "nav.about", href: "/#about" },
  { labelKey: "nav.pricing", href: "/#pricing" },
  { labelKey: "nav.blog", href: "/blog" },
  { labelKey: "nav.careers", href: "/careers" },
  { labelKey: "nav.contact", href: "/contact" },
];

/**
 * Desktop language switcher: a globe-labelled button revealing the configured
 * locales. Each option links to the equivalent path under that locale (default
 * locale = no prefix, Sinhala = `/si/...`). Closes on outside-click and Escape.
 */
function LanguageSwitcher({ pathname }: { pathname: string }) {
  const t = useLabels();
  const current = getLocaleFromPathname(pathname);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("header.changeLanguage")} — ${current.displayName}`}
        className="flex cursor-pointer items-center gap-2 text-base font-medium text-white transition-colors duration-300 hover:text-red-500"
      >
        <Globe className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        <span>{current.displayName}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 min-w-[150px] overflow-hidden rounded-xl border border-white/15 bg-black/95 py-1 backdrop-blur-md"
        >
          {LOCALE_MAP.map((locale) => {
            const active = locale.urlSlug === current.urlSlug;
            return (
              <li key={locale.urlSlug} role="none">
                <a
                  role="menuitem"
                  href={switchLocalePath(pathname, locale)}
                  hrefLang={locale.htmlLang}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    active ? "text-red-500" : "text-white hover:bg-white/10"
                  }`}
                >
                  {locale.displayName}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function Header() {
  const t = useLabels();
  const pathname = usePathname() ?? "/";
  const current = getLocaleFromPathname(pathname);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="relative z-50 border-t border-white/20">
        <div className={`py-[20px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
          <div className="flex items-center justify-between">
            <a href={localizeHref("/", current)} aria-label="Dynamic Fitness">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Dynamic Fitness" className="h-8 w-auto" />
            </a>

            {/* Desktop links + language switcher — 16px */}
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={localizeHref(link.href, current)}
                  className="text-base font-medium text-white transition-colors duration-300 hover:text-red-500"
                >
                  {t(link.labelKey)}
                </a>
              ))}
              <LanguageSwitcher pathname={pathname} />
            </div>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[6px] md:hidden"
              aria-label={t("header.toggleMenu")}
              aria-expanded={open}
            >
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  open ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  open ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black transition-all duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={localizeHref(link.href, current)}
            onClick={close}
            className="text-3xl font-normal tracking-tight text-white transition-colors duration-300 hover:text-red-500"
          >
            {t(link.labelKey)}
          </a>
        ))}

        {/* Language options */}
        <div className="mt-4 flex items-center gap-8 border-t border-white/15 pt-10">
          {LOCALE_MAP.map((locale: LocaleConfig) => {
            const active = locale.urlSlug === current.urlSlug;
            return (
              <a
                key={locale.urlSlug}
                href={switchLocalePath(pathname, locale)}
                hrefLang={locale.htmlLang}
                onClick={close}
                aria-current={active ? "true" : undefined}
                className={`text-xl transition-colors duration-300 ${
                  active ? "text-red-500" : "text-white/70 hover:text-white"
                }`}
              >
                {locale.displayName}
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Header;
