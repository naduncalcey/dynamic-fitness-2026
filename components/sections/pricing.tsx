"use client";

import { useState } from "react";
import SpotlightButton from "../ui/spotlight-button";

const CheckIcon = ({ accent = false }: { accent?: boolean }) => (
  <svg
    className={`w-4 h-4 shrink-0 mt-0.5 ${accent ? "text-red-500" : "text-white/40"}`}
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

interface Plan {
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: { text: string; accent?: boolean }[];
  cta: string;
  popular?: boolean;
}

const individualPlans: Plan[] = [
  {
    name: "Monthly",
    description: "Best for beginners",
    price: "රු 6,000",
    priceSuffix: "/mo",
    features: [
      { text: "Full gym access" },
      { text: "Locker room & showers" },
      { text: "1 Free HIIT class per week" },
      { text: "Access to Fitconnect" },
    ],
    cta: "Get Started",
  },
  {
    name: "3 Months",
    description: "For serious athletes",
    price: "රු 15,000",
    priceSuffix: "",
    features: [
      { text: "Everything in monthly", accent: true },
      { text: "Unlimited HIIT classes" },
      { text: "Nutrition guidance" },
    ],
    cta: "Get Started",
  },
  {
    name: "6 Months",
    description: "Maximum results, zero limits",
    price: "රු 28,000",
    priceSuffix: "",
    popular: true,
    features: [
      { text: "Everything in 3 months", accent: true },
      { text: "Custom meal plans" },
    ],
    cta: "Get Started",
  },
  {
    name: "12 Months",
    description: "For gym junkies",
    price: "රු 42,000",
    priceSuffix: "",
    features: [
      { text: "Everything in 6 months", accent: true },
    ],
    cta: "Get Started",
  },
];

const couplePlans: Plan[] = [
  {
    name: "6 Months - Couple",
    description: "Best value for couples",
    price: "රු 38,000",
    priceSuffix: "",
    popular: true,
    features: [
      { text: "Full gym access" },
      { text: "Locker room & showers" },
      { text: "1 Free HIIT class per week" },
      { text: "Access to Fitconnect" },
    ],
    cta: "Get Started",
  },
  {
    name: "12 Months - Couple",
    description: "Ultimate duo commitment",
    price: "රු 58,000",
    priceSuffix: "",
    features: [
      { text: "Everything in 6 months", accent: true },
    ],
    cta: "Get Started",
  },
];

const Pricing = () => {
  const [isCouple, setIsCouple] = useState(false);
  const plans = isCouple ? couplePlans : individualPlans;

  return (
    <section id="pricing" className="w-full border-t border-white/20 scroll-mt-20">
      {/* Section Intro */}
      <div className="container lg:border-x lg:border-white/20 pt-[60px] md:pt-[80px] lg:pt-[100px] pb-12 md:pb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-medium text-white/70 uppercase tracking-[0.25em]">
                02
              </span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-[12px] font-medium text-red-600 uppercase tracking-[0.25em]">
                Select Plan
              </span>
            </div>
            <h2 className="text-white text-[32px] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
              Choose your
              <br />
              <span className="text-white/50">membership</span>
            </h2>
          </div>

          {/* Toggle */}
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
              onClick={() => setIsCouple(!isCouple)}
              className="relative w-14 h-7 rounded-full bg-white/10 border border-white/15 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)] cursor-pointer transition-colors duration-300 hover:bg-white/15"
            >
              <div
                className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.3)] transition-transform duration-300 border border-white/60 flex items-center justify-center ${
                  isCouple ? "translate-x-7" : "translate-x-0"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.15)]" />
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
              <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                Save 15%
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="container lg:border-x lg:border-white/20 !px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-y border-white/10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 lg:p-10 flex flex-col group overflow-hidden transition-colors hover:bg-white/[0.02] relative ${
                plan.popular ? "bg-white/[0.02]" : ""
              }`}
            >
              {/* Dot pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:6px_6px] opacity-40 z-0" />

              {/* Hover line */}
              <div
                className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent transition-all duration-700 ${
                  plan.popular
                    ? "via-red-500 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    : "via-red-500 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                }`}
              />

              <div className="relative z-10 flex flex-col h-full">
                {/* Plan header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-white tracking-tight mb-2">
                      {plan.name}
                    </h3>
                    {plan.popular && (
                      <span className="text-[9px] uppercase tracking-widest text-red-400 border border-red-500/30 px-1.5 py-0.5 bg-red-500/10">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wide">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-normal text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span className="text-sm text-gray-400">{plan.priceSuffix}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckIcon accent={feature.accent} />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <SpotlightButton
                  variant={plan.popular ? "red" : "gray"}
                  className="w-full justify-center"
                  onClick={() => window.open("https://fitconnect.me/download?o=DFG&b=MAH", "_blank")}
                >
                  {plan.cta}
                </SpotlightButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
