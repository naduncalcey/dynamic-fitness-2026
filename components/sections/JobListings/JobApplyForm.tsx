"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLabels } from "@/lib/i18n/LabelsProvider";

/**
 * Inline "Easy Apply" form for a single job, expanded under its card. Reuses the
 * careers endpoint (/api/careers) — the job title rides along as the `position`,
 * so applications land in the same inbox with the role attached. Shares the
 * careers.* labels, the honeypot, and the Cloudflare Turnstile CAPTCHA.
 *
 * Unlike the always-rendered careers form (which relies on Turnstile's implicit
 * auto-render), this form mounts on demand, so it renders the widget explicitly
 * via window.turnstile.render and cleans it up on unmount.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/40";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-white/70";

export function JobApplyForm({ jobTitle }: { jobTitle: string }) {
  const t = useLabels();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Explicitly render the Turnstile widget once the script is ready. The script
  // tag itself is mounted once by JobListingsDefault.
  useEffect(() => {
    if (!turnstileSiteKey) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const render = () => {
      if (cancelled) return;
      if (window.turnstile && widgetEl.current && widgetId.current === null) {
        widgetId.current = window.turnstile.render(widgetEl.current, {
          sitekey: turnstileSiteKey,
          theme: "dark",
        });
      } else if (!window.turnstile) {
        timer = setTimeout(render, 200);
      }
    };
    render();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget already gone */
        }
        widgetId.current = null;
      }
    };
  }, [turnstileSiteKey]);

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

  if (status === "success") {
    return (
      <div role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <p className="text-white">{t("careers.success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-5 border-t border-white/10 pt-6">
      <div>
        <h4 className="text-base font-medium text-white">{t("jobs.applyFor", { title: jobTitle })}</h4>
        <p className="mt-1 text-sm text-gray-400">{t("jobs.applyIntro")}</p>
      </div>

      {/* Carries the role to /api/careers; honeypot catches bots. */}
      <input type="hidden" name="position" value={jobTitle} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ja-name" className={labelClass}>
            {t("careers.fullName")} *
          </label>
          <input id="ja-name" name="name" required className={fieldClass} placeholder={t("careers.fullNamePlaceholder")} />
        </div>
        <div>
          <label htmlFor="ja-email" className={labelClass}>
            {t("careers.email")} *
          </label>
          <input id="ja-email" name="email" type="email" required className={fieldClass} placeholder="jane@example.com" />
        </div>
      </div>

      <div>
        <label htmlFor="ja-phone" className={labelClass}>
          {t("careers.phone")}
        </label>
        <input id="ja-phone" name="phone" className={fieldClass} placeholder="+94 ..." />
      </div>

      <div>
        <label htmlFor="ja-message" className={labelClass}>
          {t("careers.message")}
        </label>
        <textarea id="ja-message" name="message" rows={4} className={fieldClass} placeholder={t("careers.messagePlaceholder")} />
      </div>

      <div>
        <label htmlFor="ja-cv" className={labelClass}>
          {t("careers.cv")} *
        </label>
        <input
          id="ja-cv"
          name="cv"
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="block w-full text-sm text-white/70 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.1em] file:text-white hover:file:bg-white/20"
        />
      </div>

      {/* Turnstile renders into this element (see effect above). */}
      {turnstileSiteKey ? <div ref={widgetEl} /> : null}

      {status === "error" && error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-fit cursor-pointer rounded-[18px] border border-[var(--cta-red-border)] bg-[var(--cta-surface)] px-8 py-[0.9rem] text-sm uppercase tracking-[0.12em] text-[var(--cta-text)] backdrop-blur-md transition-colors duration-300 hover:text-[var(--cta-text-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? t("careers.sending") : t("careers.submit")}
      </button>
    </form>
  );
}

export default JobApplyForm;
