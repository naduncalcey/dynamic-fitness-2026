"use client";

import { useState } from "react";
import Script from "next/script";
import { RichText } from "@/components/common/RichText";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { Briefcase, MapPin, Tag, ChevronDown } from "lucide-react";
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

function JobCard({ job }: { job: JobEntry }) {
  const t = useLabels();
  const [showDetails, setShowDetails] = useState(false);
  const [applying, setApplying] = useState(false);
  // Pre-formatted server-side (see jobListings definition) to stay hydration-safe.
  const posted = job.postedDisplay;
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
            {job.employmentType ? (
              <Badge icon={<Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />}>{job.employmentType}</Badge>
            ) : null}
            {job.location ? (
              <Badge icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />}>{job.location}</Badge>
            ) : null}
            {job.department ? (
              <Badge icon={<Tag className="h-3.5 w-3.5" strokeWidth={1.5} />}>{job.department}</Badge>
            ) : null}
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
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
              strokeWidth={1.5}
              aria-hidden
            />
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
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/70">
          {t("jobs.posted", { date: posted })}
        </p>
      ) : null}
    </div>
  );
}

export function JobListingsDefault({ section }: { section: JobListingsSection }) {
  const { heading, description, emptyMessage, jobs } = section;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default JobListingsDefault;
