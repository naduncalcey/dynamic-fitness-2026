"use client";

import { useEffect, useState } from "react";
import { Cta } from "@/components/common/Cta";
import { PRICING_VIEW_COOKIE, getCookie, setCookie } from "@/lib/cookies";
import type { CtaEntry, PricingPlanEntry } from "@/lib/contentful/common/types";
import type { InfoSection } from "@/lib/sections/types";

/**
 * Info - Pricing. Recreates the old site's membership section: number/label
 * eyebrow, split headline, an Individual/Couple toggle, and a divided grid of
 * plan cards. The "popular" plan gets a persistent red top-border + red CTA;
 * others reveal the red border on hover and use the gray CTA.
 */

type InfoPricingProps = {
  section: InfoSection;
};

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

// Accent (red) check for "Everything in …" carry-over features, matching the old site.
const isAccentFeature = (text: string) => /^everything in/i.test(text.trim());

function CheckIcon({ accent }: { accent: boolean }) {
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 ${accent ? "text-red-500" : "text-white/40"}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PlanCard({ plan }: { plan: PricingPlanEntry }) {
  const popular = Boolean(plan.isPopular);
  const features = (plan.features ?? []).filter((f): f is string => Boolean(f));

  const planCta: CtaEntry = {
    sys: { id: `${plan.sys.id}-cta` },
    label: plan.ctaLabel ?? "Get Started",
    variant: popular ? "Red" : "Gray",
    size: "Medium",
    linkBehavior: "External",
    externalLink: plan.ctaLink ?? "#",
    newTab: true,
    fullWidth: true,
    showArrow: false,
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden p-8 transition-colors hover:bg-white/[0.02] lg:p-10 ${
        popular ? "bg-white/[0.02]" : ""
      }`}
    >
      {/* Decorative dot pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:6px_6px] opacity-40" />
      {/* Top accent border: persistent for popular, hover for the rest */}
      <div
        className={`absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent to-transparent transition-all duration-700 ${
          popular
            ? "via-red-500 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            : "via-red-500 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]"
        }`}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <h3 className="mb-2 text-lg font-medium tracking-tight text-white">{plan.name}</h3>
            {popular ? (
              <span className="border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-red-400">
                Popular
              </span>
            ) : null}
          </div>
          <p className="font-mono text-xs uppercase tracking-wide text-gray-400">
            {plan.description}
          </p>
        </div>

        <div className="mb-8 flex items-baseline gap-1">
          <span className="text-4xl font-normal tracking-tight text-white">{plan.price}</span>
          {plan.priceSuffix ? (
            <span className="text-sm text-gray-400">{plan.priceSuffix}</span>
          ) : null}
        </div>

        <ul className="mb-8 flex flex-1 flex-col gap-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon accent={isAccentFeature(feature)} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Cta cta={planCta} className="w-full justify-center" />
      </div>
    </div>
  );
}

export function InfoPricing({ section }: InfoPricingProps) {
  const {
    sectionNumber,
    sectionLabel,
    headline,
    headlineFaded,
    coupleDiscountLabel,
    individualPlans,
    couplePlans,
  } = section;

  const [isCouple, setIsCouple] = useState(false);
  const hasCouple = couplePlans.length > 0;
  const plans = isCouple && hasCouple ? couplePlans : individualPlans;

  // Restore the visitor's last view from a cookie (functional preference).
  useEffect(() => {
    if (getCookie(PRICING_VIEW_COOKIE) === "couple") setIsCouple(true);
  }, []);

  const toggleView = () =>
    setIsCouple((prev) => {
      const next = !prev;
      setCookie(PRICING_VIEW_COOKIE, next ? "couple" : "individual", 180);
      return next;
    });

  return (
    <section id="pricing" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
      <div
        className={`pt-[60px] pb-12 md:pt-[80px] md:pb-16 lg:pt-[100px] lg:border-x lg:border-white/20 ${CONTAINER}`}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-white/70">
                {sectionNumber}
              </span>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-red-600">
                {sectionLabel}
              </span>
            </div>
            <h2 className="text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {headline}
              <br />
              <span className="text-white/50">{headlineFaded}</span>
            </h2>
          </div>

          {hasCouple ? (
            <div className="flex items-center">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-sm">
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    !isCouple ? "text-white" : "text-white/40"
                  }`}
                >
                  Individual
                </span>
                <button
                  type="button"
                  aria-label="Toggle individual or couple pricing"
                  onClick={toggleView}
                  className="relative h-7 w-14 cursor-pointer rounded-full border border-white/15 bg-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:bg-white/15"
                >
                  <div
                    className={`absolute left-[3px] top-[3px] flex h-[20px] w-[20px] items-center justify-center rounded-full border border-white/60 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.3)] transition-transform duration-300 ${
                      isCouple ? "translate-x-7" : "translate-x-0"
                    }`}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.15)]" />
                  </div>
                </button>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isCouple ? "text-white" : "text-white/40"
                    }`}
                  >
                    Couple
                  </span>
                  {coupleDiscountLabel ? (
                    <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      {coupleDiscountLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${CONTAINER} !px-0 lg:border-x lg:border-white/20`}>
        <div className="grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.sys.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default InfoPricing;
