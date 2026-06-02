"use client";

import { useState } from "react";

/**
 * Global site header, recreated from the previous Dynamic Fitness site: logo on
 * the left, nav links on the right (desktop), and an animated hamburger that
 * opens a full-screen overlay menu on mobile. Non-sticky. Static layout chrome;
 * rendered once in app/layout.tsx.
 *
 * Desktop nav links are 16px (text-base) per request.
 */

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="relative z-50 border-t border-white/20">
        <div className={`py-[20px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
          <div className="flex items-center justify-between">
            <a href="/" aria-label="Dynamic Fitness">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Dynamic Fitness" className="h-8 w-auto" />
            </a>

            {/* Desktop links — 16px */}
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-white transition-colors duration-300 hover:text-red-500"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[6px] md:hidden"
              aria-label="Toggle menu"
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
            href={link.href}
            onClick={close}
            className="text-3xl font-normal tracking-tight text-white transition-colors duration-300 hover:text-red-500"
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}

export default Header;
