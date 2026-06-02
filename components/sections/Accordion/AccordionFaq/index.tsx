"use client";

import { useState } from "react";
import { Cta } from "@/components/common/Cta";
import { RichText } from "@/components/common/RichText";
import type { AccordionSection } from "@/lib/sections/types";

/**
 * Accordion - FAQ. Recreates the old site's FAQ section: a two-column layout
 * with an intro column (number/label, stacked headline, description, CTA) and a
 * divided list of expand/collapse question rows. Single item open at a time;
 * the plus icon rotates 45° to an "×" when open.
 */

type AccordionFaqProps = {
  section: AccordionSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

export function AccordionFaq({ section }: AccordionFaqProps) {
  const { sectionNumber, sectionLabel, headline, description, cta, items } = section;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));
  const headlineWords = (headline ?? "").split(" ");

  return (
    <section className="w-full border-t border-white/20 bg-black">
      <div className={`py-[60px] md:py-[80px] lg:py-[100px] lg:border-x lg:border-white/20 ${CONTAINER}`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* Intro column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-white/70">
                {sectionNumber}
              </span>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-red-600">
                {sectionLabel}
              </span>
            </div>

            <h2 className="mt-6 text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:mt-10 md:text-5xl lg:text-6xl">
              {headlineWords.map((word, i) => (
                <span key={i}>
                  {word}
                  {i < headlineWords.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>

            {description ? (
              <RichText
                content={description}
                className="mt-8 max-w-sm text-sm leading-relaxed text-gray-400 md:text-base [&_a]:text-red-400 [&_a]:underline [&_p]:text-gray-400 [&_p:last-child]:mb-0"
              />
            ) : null}

            {cta ? <Cta cta={cta} className="mt-6" /> : null}
          </div>

          {/* Accordion column */}
          <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 lg:border-t-0">
            {items.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.sys.id} className="py-5 md:py-6">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={open}
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 text-left"
                  >
                    <span className="text-sm font-medium uppercase tracking-[0.05em] text-white md:text-base">
                      {item.question}
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center text-white/40 transition-transform duration-300 ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      open ? "mt-3 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.answer ? (
                      <RichText
                        content={item.answer}
                        className="pr-10 text-base leading-relaxed text-gray-400 [&_a]:text-red-400 [&_a]:underline [&_p]:text-gray-400 [&_p:last-child]:mb-0"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccordionFaq;
