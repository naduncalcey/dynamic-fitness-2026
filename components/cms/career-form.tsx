"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { CareerListing } from "@/lib/content-types";

export default function CareerForm({
  listing,
}: {
  listing?: CareerListing;
}) {
  const router = useRouter();
  const isEdit = Boolean(listing);

  const [title, setTitle] = useState(listing?.title ?? "");
  const [type, setType] = useState(listing?.type ?? "Full-time");
  const [location, setLocation] = useState(listing?.location ?? "On-site");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [requirements, setRequirements] = useState<string[]>(
    listing?.requirements ?? [""]
  );
  const [isActive, setIsActive] = useState(listing?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const payload = {
      title: title.trim(),
      type,
      location,
      description: description.trim(),
      requirements: requirements.filter((r) => r.trim()),
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (isEdit && listing) {
      await supabase
        .from("career_listings")
        .update(payload)
        .eq("id", listing.id);
    } else {
      await supabase.from("career_listings").insert(payload);
    }

    router.push("/cms/careers");
  };

  const addRequirement = () => setRequirements([...requirements, ""]);
  const removeRequirement = (i: number) =>
    setRequirements(requirements.filter((_, idx) => idx !== i));
  const updateRequirement = (i: number, val: string) =>
    setRequirements(requirements.map((r, idx) => (idx === i ? val : r)));

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-3 py-2.5 rounded-md focus:outline-none focus:border-zinc-600 transition-colors";

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Job Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Personal Trainer"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          >
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe the role and responsibilities..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Requirements
        </label>
        <div className="space-y-2">
          {requirements.map((req, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) => updateRequirement(i, e.target.value)}
                placeholder="e.g. 2+ years experience"
                className={`${inputClass} flex-1`}
              />
              <button
                onClick={() => removeRequirement(i)}
                className="text-zinc-600 hover:text-red-400 px-2 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={addRequirement}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            + Add requirement
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="accent-red-500"
        />
        <label htmlFor="is_active" className="text-sm text-zinc-400">
          Active (visible on website)
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
        >
          {saving ? "Saving..." : isEdit ? "Update Listing" : "Create Listing"}
        </button>
        <a
          href="/cms/careers"
          className="text-sm text-zinc-400 hover:text-white px-4 py-2.5 transition-colors"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
