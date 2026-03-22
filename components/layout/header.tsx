"use client";

import { useState } from "react";
import Image from "next/image";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Pricing", href: "#pricing" },
];

const Header = () => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <nav className="relative z-50">
        <div className="container lg:border-x lg:border-white/20 py-[20px]">
          <div className="flex items-center justify-between">
            <Image
              src="/logo.svg"
              alt="Dynamic Fitness"
              width={140}
              height={40}
              className="h-8 w-auto"
            />

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-white text-sm font-medium hover:text-red-500 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[6px] cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-px bg-white transition-all duration-300 ${
                  open ? "rotate-45 translate-y-[3.5px]" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-white transition-all duration-300 ${
                  open ? "-rotate-45 -translate-y-[3.5px]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile nav */}
      <div
        className={`fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={close}
            className="text-white text-3xl font-normal tracking-tight hover:text-red-500 transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
};

export default Header;