"use client";

import { useState } from "react";
import SpotlightButton from "../ui/spotlight-button";
import type { FAQContent } from "@/lib/content-types";
import { faqDefaults } from "@/lib/content-defaults";

const FAQ = ({ content }: { content?: FAQContent }) => {
  const c = content ?? faqDefaults;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) =>
    setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="w-full border-t border-white/20">
      <div className="container lg:border-x lg:border-white/20 py-[60px] md:py-[80px] lg:py-[100px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          {/* Left column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-medium text-white/70 uppercase tracking-[0.25em]">
                {c.sectionNumber}
              </span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-[12px] font-medium text-red-600 uppercase tracking-[0.25em]">
                {c.sectionLabel}
              </span>
            </div>

            <h2 className="mt-6 md:mt-10 text-white text-[32px] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
              {c.headline.split(" ").map((word, i) => (
                <span key={i}>
                  {word}
                  {i < c.headline.split(" ").length - 1 && <br />}
                </span>
              ))}
            </h2>

            <p className="mt-8 text-sm md:text-base text-gray-400 leading-relaxed max-w-sm">
              {c.description}
            </p>

            <SpotlightButton className="mt-6">{c.contactCtaText}</SpotlightButton>
          </div>

          {/* Right column — accordion */}
          <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 lg:border-t-0">
            {c.faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="group w-full text-left py-5 md:py-6 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm md:text-base text-white uppercase tracking-[0.05em] font-medium">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 w-6 h-6 flex items-center justify-center text-white/40 transition-transform duration-300 ${
                      openIndex === i ? "rotate-45" : ""
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === i
                      ? "max-h-48 opacity-100 mt-3"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm text-gray-400 leading-relaxed pr-10 normal-case tracking-normal">
                    {faq.answer}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
