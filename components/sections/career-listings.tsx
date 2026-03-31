"use client";

import { useState } from "react";
import type { CareerListing } from "@/lib/content-types";

function ApplicationForm({
  listing,
  onClose,
}: {
  listing: CareerListing;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("listing_id", listing.id);

    const res = await fetch("/api/careers/apply", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="text-green-400 text-lg font-medium mb-2">
          Application Submitted
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Thank you for applying for {listing.title}. We&apos;ll review your
          application and get back to you soon.
        </p>
        <button
          onClick={onClose}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white text-lg font-medium">
            Apply for {listing.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Fill out the form below to submit your application.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors p-1"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-black border border-zinc-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-black border border-zinc-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full bg-black border border-zinc-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            Why are you interested in this role?
          </label>
          <textarea
            name="message"
            rows={4}
            className="w-full bg-black border border-zinc-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            Resume (PDF)
          </label>
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            className="w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:border file:border-zinc-800 file:bg-zinc-900 file:text-zinc-300 file:text-xs file:cursor-pointer hover:file:bg-zinc-800 file:transition-colors"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white text-sm font-medium py-3 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default function CareerListings({
  listings,
}: {
  listings: CareerListing[];
}) {
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  if (listings.length === 0) {
    return (
      <section className="w-full border-t border-white/20">
        <div className="container lg:border-x lg:border-white/20 py-16 md:py-24">
          <p className="text-gray-400 text-center">
            No open positions at the moment. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full border-t border-white/20">
      <div className="container lg:border-x lg:border-white/20 py-6 md:py-8">
        <div className="w-full space-y-4">
          {listings.map((listing) => (
            <div key={listing.id}>
              <div
                className={`group border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 p-6 md:p-8 transition-all ${
                  applyingTo === listing.id ? "border-red-500/30" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white text-lg font-medium tracking-tight">
                      {listing.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-xs text-zinc-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                        {listing.type}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                        {listing.location}
                      </span>
                    </div>
                    {listing.description && (
                      <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                        {listing.description}
                      </p>
                    )}
                    {listing.requirements.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {listing.requirements.map((req, i) => (
                          <li
                            key={i}
                            className="text-sm text-zinc-400 flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-0.5">&#8226;</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setApplyingTo(
                        applyingTo === listing.id ? null : listing.id
                      )
                    }
                    className="shrink-0 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium px-6 py-2.5 transition-colors"
                  >
                    {applyingTo === listing.id ? "Cancel" : "Apply Now"}
                  </button>
                </div>
              </div>

              {applyingTo === listing.id && (
                <div className="mt-6">
                  <ApplicationForm
                    listing={listing}
                    onClose={() => setApplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
