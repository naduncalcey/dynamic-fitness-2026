"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";
import { RichText } from "@/components/common/RichText";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import type { CareersFormSection } from "@/lib/sections/types";

/**
 * Careers Form. A two-column section: intro copy on the left, application form
 * on the right. Submits multipart (fields + CV) to /api/careers, which emails
 * the application via Resend. Includes a honeypot field for basic spam defense.
 */

type CareersFormDefaultProps = {
  section: CareersFormSection;
};

type Status = "idle" | "submitting" | "success" | "error";

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";
const fieldClass =
  "w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-white/50";

export function CareersFormDefault({ section }: CareersFormDefaultProps) {
  const { heading, description, positions, successMessage } = section;
  const t = useLabels();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(data.error ?? t("careers.errorGeneric"));
      }
    } catch {
      setStatus("error");
      setError(t("careers.errorNetwork"));
    }
  };

  return (
    <section id="careers" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
      <div className={`grid grid-cols-1 gap-12 py-[60px] md:py-[80px] lg:grid-cols-2 lg:gap-16 lg:border-x lg:border-white/20 lg:py-[100px] ${CONTAINER}`}>
        {/* Intro */}
        <div>
          <h1 className="text-[32px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            {heading}
          </h1>
          {description ? (
            <RichText
              content={description}
              className="mt-6 max-w-md text-sm leading-relaxed text-gray-400 md:text-base [&_a]:text-red-400 [&_a]:underline [&_p]:text-gray-400 [&_p:last-child]:mb-0"
            />
          ) : null}
        </div>

        {/* Form / success */}
        <div>
          {status === "success" ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
              <p className="text-lg text-white">
                {successMessage ?? t("careers.success")}
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              {/* Honeypot (hidden from humans) */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="cf-name" className={labelClass}>
                    {t("careers.fullName")} *
                  </label>
                  <input id="cf-name" name="name" required className={fieldClass} placeholder={t("careers.fullNamePlaceholder")} />
                </div>
                <div>
                  <label htmlFor="cf-email" className={labelClass}>
                    {t("careers.email")} *
                  </label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    required
                    className={fieldClass}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="cf-phone" className={labelClass}>
                    {t("careers.phone")}
                  </label>
                  <input id="cf-phone" name="phone" className={fieldClass} placeholder="+94 ..." />
                </div>
                <div>
                  <label htmlFor="cf-position" className={labelClass}>
                    {t("careers.position")} *
                  </label>
                  <div className="relative">
                    <select
                      id="cf-position"
                      name="position"
                      required
                      defaultValue=""
                      className={`${fieldClass} cursor-pointer appearance-none bg-[#0d0d0d] pr-10`}
                    >
                      <option value="" disabled>
                        {t("careers.selectPosition")}
                      </option>
                      {positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value="General Application">{t("careers.generalApplication")}</option>
                    </select>
                    <svg
                      aria-hidden
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="cf-message" className={labelClass}>
                  {t("careers.message")}
                </label>
                <textarea
                  id="cf-message"
                  name="message"
                  rows={4}
                  className={fieldClass}
                  placeholder={t("careers.messagePlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="cf-cv" className={labelClass}>
                  {t("careers.cv")} *
                </label>
                <input
                  id="cf-cv"
                  name="cv"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="block w-full text-sm text-white/70 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.1em] file:text-white hover:file:bg-white/20"
                />
              </div>

              {/* Cloudflare Turnstile CAPTCHA — injects the cf-turnstile-response token into the form */}
              {turnstileSiteKey ? (
                <>
                  <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    strategy="afterInteractive"
                  />
                  <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark" />
                </>
              ) : null}

              {status === "error" && error ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-2 w-fit cursor-pointer rounded-[18px] border border-[var(--cta-red-border)] bg-[var(--cta-surface)] px-8 py-[0.9rem] text-sm uppercase tracking-[0.12em] text-[var(--cta-text)] backdrop-blur-md transition-colors duration-300 hover:text-[var(--cta-text-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? t("careers.sending") : t("careers.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default CareersFormDefault;
