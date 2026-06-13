"use client";

import { useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { RichText } from "@/components/common/RichText";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { getLocaleFromPathname } from "@/lib/i18n/locale";
import type { JobEntry, JobListingsSection } from "@/lib/sections/types";
import { JobApplyForm } from "../JobApplyForm";

/**
 * Job Listings. A LinkedIn-style list of open roles: each card shows the title,
 * meta badges (type · location · department), and a summary, with a "View
 * details" disclosure (full description + responsibilities + requirements) and
 * an "Apply Now" toggle that expands the inline apply form. The form posts to
 * /api/careers with the job title as the position.
 */

const CONTAINER = "mx-auto w-full max-w-[1240px] px-6 lg:px-10";

function BriefcaseIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function Badge({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">
      {icon}
      {children}
    </span>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
            <span className="mt-0.5 text-red-500">&#8226;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Format a posted date deterministically. Both the locale and the time zone are
 * pinned explicitly so the server and client render byte-identical strings (the
 * runtime defaults differ — Node resolves en-US/UTC, the browser uses the user's
 * locale/zone — which otherwise causes a hydration mismatch). `postedDate` is a
 * Contentful date-only value parsed as UTC midnight, so we format in UTC to keep
 * the calendar day intact regardless of the viewer's zone.
 */
function formatPosted(date: string | null, locale: string): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function JobCard({ job, locale }: { job: JobEntry; locale: string }) {
  const t = useLabels();
  const [showDetails, setShowDetails] = useState(false);
  const [applying, setApplying] = useState(false);
  const posted = formatPosted(job.postedDate, locale);
  const hasDetails =
    Boolean(job.description?.json) || job.responsibilities.length > 0 || job.requirements.length > 0;

  return (
    <div
      id={job.slug ? `job-${job.slug}` : undefined}
      className="scroll-mt-24 rounded-2xl border border-white/15 bg-white/[0.02] p-6 transition-colors hover:border-white/25 md:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium tracking-tight text-white md:text-xl">{job.title}</h3>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {job.employmentType ? <Badge icon={<BriefcaseIcon />}>{job.employmentType}</Badge> : null}
            {job.location ? <Badge icon={<PinIcon />}>{job.location}</Badge> : null}
            {job.department ? <Badge icon={<TagIcon />}>{job.department}</Badge> : null}
          </div>
          {job.summary ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">{job.summary}</p> : null}
        </div>

        <button
          type="button"
          onClick={() => setApplying((v) => !v)}
          aria-expanded={applying}
          className="shrink-0 cursor-pointer rounded-full border border-[var(--cta-red-border)] bg-red-500/10 px-6 py-2.5 text-sm font-medium uppercase tracking-[0.1em] text-red-400 transition-colors hover:bg-red-500/20"
        >
          {applying ? t("jobs.cancel") : t("jobs.applyNow")}
        </button>
      </div>

      {hasDetails ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
            className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            {showDetails ? t("jobs.hideDetails") : t("jobs.viewDetails")}
            <svg
              className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
            </svg>
          </button>

          {showDetails ? (
            <div className="mt-4 border-t border-white/10 pt-5">
              {job.description?.json ? (
                <RichText
                  content={job.description}
                  className="text-sm leading-relaxed text-gray-400 [&_a]:text-red-400 [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
                />
              ) : null}
              <Bullets title={t("jobs.responsibilities")} items={job.responsibilities} />
              <Bullets title={t("jobs.requirements")} items={job.requirements} />
              {job.compensation ? (
                <p className="mt-5 text-sm text-white/70">
                  <span className="text-white/50">{job.compensation}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {applying && job.title ? <JobApplyForm jobTitle={job.title} /> : null}

      {posted ? (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/30">
          {t("jobs.posted", { date: posted })}
        </p>
      ) : null}
    </div>
  );
}

export function JobListingsDefault({ section }: { section: JobListingsSection }) {
  const { heading, description, emptyMessage, jobs } = section;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Match useLabels(): derive the active locale from the URL so dates format in
  // the chosen language and render identically on server and client.
  const locale = getLocaleFromPathname(usePathname() ?? "/").htmlLang;

  return (
    <section id="open-positions" className="w-full scroll-mt-20 border-t border-white/20 bg-black">
      {/* Loaded once for the whole section; each apply form renders its own widget. */}
      {turnstileSiteKey ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}

      <div className={`py-[60px] md:py-[80px] lg:border-x lg:border-white/20 lg:py-[100px] ${CONTAINER}`}>
        {heading ? (
          <h2 className="text-[28px] font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            {heading}
          </h2>
        ) : null}
        {description ? (
          <RichText
            content={description}
            className="mt-5 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base [&_a]:text-red-400 [&_a]:underline [&_p:last-child]:mb-0"
          />
        ) : null}

        {jobs.length === 0 ? (
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-gray-400">{emptyMessage}</p>
        ) : (
          <div className="mt-10 flex flex-col gap-5">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default JobListingsDefault;
