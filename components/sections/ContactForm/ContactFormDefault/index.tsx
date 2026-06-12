"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";
import { RichText } from "@/components/common/RichText";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import type { ContactFormSection } from "@/lib/sections/types";

/**
 * Contact Form. A two-column section: intro copy on the left, enquiry form on
 * the right. Submits (fields only — no attachment) to /api/contact, which emails
 * the enquiry via Resend. Includes a honeypot field for basic spam defense and
 * the same Cloudflare Turnstile widget as the careers form.
 */

type ContactFormDefaultProps = {
  section: ContactFormSection;
};

type Status = "idle" | "submitting" | "success" | "error";

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";
const fieldClass =
  "w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-white/50";

export function ContactFormDefault({ section }: ContactFormDefaultProps) {
  const { heading, description, successMessage } = section;
  const t = useLabels();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(data.error ?? t("contact.errorGeneric"));
      }
    } catch {
      setStatus("error");
      setError(t("contact.errorNetwork"));
    }
  };

  return (
    <section id="contact" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
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
                {successMessage ?? t("contact.success")}
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
                  <label htmlFor="cof-name" className={labelClass}>
                    {t("contact.fullName")} *
                  </label>
                  <input id="cof-name" name="name" required className={fieldClass} placeholder={t("contact.fullNamePlaceholder")} />
                </div>
                <div>
                  <label htmlFor="cof-email" className={labelClass}>
                    {t("contact.email")} *
                  </label>
                  <input
                    id="cof-email"
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
                  <label htmlFor="cof-phone" className={labelClass}>
                    {t("contact.phone")}
                  </label>
                  <input id="cof-phone" name="phone" className={fieldClass} placeholder="+94 ..." />
                </div>
                <div>
                  <label htmlFor="cof-subject" className={labelClass}>
                    {t("contact.subject")}
                  </label>
                  <input id="cof-subject" name="subject" className={fieldClass} placeholder={t("contact.subjectPlaceholder")} />
                </div>
              </div>

              <div>
                <label htmlFor="cof-message" className={labelClass}>
                  {t("contact.message")} *
                </label>
                <textarea
                  id="cof-message"
                  name="message"
                  rows={5}
                  required
                  className={fieldClass}
                  placeholder={t("contact.messagePlaceholder")}
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
                {status === "submitting" ? t("contact.sending") : t("contact.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactFormDefault;
