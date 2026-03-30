"use client";

import { useState } from "react";
import ArrayField from "./array-field";
import NestedArrayField from "./nested-array-field";
import type { Plan } from "@/lib/content-types";

interface SectionFormProps {
  page: string;
  section: string;
  content: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => Promise<void>;
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
        />
      )}
    </div>
  );
}

function PlanEditor({
  label,
  plans,
  onChange,
}: {
  label: string;
  plans: Plan[];
  onChange: (plans: Plan[]) => void;
}) {
  const addPlan = () => {
    onChange([
      ...plans,
      { name: "", description: "", price: "", priceSuffix: "", features: [], cta: "Get Started" },
    ]);
  };

  const removePlan = (index: number) => {
    onChange(plans.filter((_, i) => i !== index));
  };

  const updatePlan = (index: number, key: string, value: unknown) => {
    const updated = plans.map((plan, i) =>
      i === index ? { ...plan, [key]: value } : plan
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
        <button type="button" onClick={addPlan} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
          + Add Plan
        </button>
      </div>
      {plans.map((plan, index) => (
        <div key={index} className="border border-zinc-800 rounded-lg p-4 space-y-3 bg-zinc-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 font-mono">Plan #{index + 1}</span>
            <button type="button" onClick={() => removePlan(index)} className="text-xs text-red-400/60 hover:text-red-400 cursor-pointer">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Name</label>
              <input type="text" value={plan.name} onChange={(e) => updatePlan(index, "name", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Price</label>
              <input type="text" value={plan.price} onChange={(e) => updatePlan(index, "price", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Description</label>
              <input type="text" value={plan.description} onChange={(e) => updatePlan(index, "description", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Price Suffix</label>
              <input type="text" value={plan.priceSuffix ?? ""} onChange={(e) => updatePlan(index, "priceSuffix", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">CTA Text</label>
              <input type="text" value={plan.cta} onChange={(e) => updatePlan(index, "cta", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input type="checkbox" checked={plan.popular ?? false} onChange={(e) => updatePlan(index, "popular", e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900" />
                <span className="text-xs text-zinc-400">Mark as Popular</span>
              </label>
            </div>
          </div>
          <NestedArrayField
            label="Features"
            items={plan.features}
            onChange={(features) => updatePlan(index, "features", features)}
          />
        </div>
      ))}
    </div>
  );
}

export default function SectionForm({ page, section, content, onSave }: SectionFormProps) {
  const [data, setData] = useState<Record<string, unknown>>(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderFields = () => {
    // Hero section
    if (page === "home" && section === "hero") {
      return (
        <>
          <TextField label="Headline" value={String(data.headline ?? "")} onChange={(v) => update("headline", v)} />
          <TextField label="Highlight Text (gradient)" value={String(data.highlightText ?? "")} onChange={(v) => update("highlightText", v)} />
          <TextField label="CTA Button Text" value={String(data.ctaText ?? "")} onChange={(v) => update("ctaText", v)} />
          <TextField label="CTA Link (URL)" value={String(data.ctaLink ?? "")} onChange={(v) => update("ctaLink", v)} />
        </>
      );
    }

    // About section
    if (page === "home" && section === "about") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Section Number" value={String(data.sectionNumber ?? "")} onChange={(v) => update("sectionNumber", v)} />
            <TextField label="Section Label" value={String(data.sectionLabel ?? "")} onChange={(v) => update("sectionLabel", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Headline" value={String(data.headline ?? "")} onChange={(v) => update("headline", v)} />
            <TextField label="Headline Faded" value={String(data.headlineFaded ?? "")} onChange={(v) => update("headlineFaded", v)} />
          </div>
          <TextField label="Description" value={String(data.description ?? "")} onChange={(v) => update("description", v)} multiline />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="CTA Text" value={String(data.ctaText ?? "")} onChange={(v) => update("ctaText", v)} />
            <TextField label="CTA Link (Maps URL)" value={String(data.ctaLink ?? "")} onChange={(v) => update("ctaLink", v)} />
          </div>
          <ArrayField
            label="Image Tooltips"
            items={(data.imageTooltips as string[] ?? []).map((t) => ({ text: t }))}
            fields={[{ key: "text", label: "Tooltip Text" }]}
            onChange={(items) => update("imageTooltips", items.map((i) => i.text))}
          />
        </>
      );
    }

    // Pricing section
    if (page === "home" && section === "pricing") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Section Number" value={String(data.sectionNumber ?? "")} onChange={(v) => update("sectionNumber", v)} />
            <TextField label="Section Label" value={String(data.sectionLabel ?? "")} onChange={(v) => update("sectionLabel", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Headline" value={String(data.headline ?? "")} onChange={(v) => update("headline", v)} />
            <TextField label="Headline Faded" value={String(data.headlineFaded ?? "")} onChange={(v) => update("headlineFaded", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Couple Discount Label" value={String(data.coupleDiscountLabel ?? "")} onChange={(v) => update("coupleDiscountLabel", v)} />
            <TextField label="CTA Link (download)" value={String(data.ctaLink ?? "")} onChange={(v) => update("ctaLink", v)} />
          </div>
          <PlanEditor
            label="Individual Plans"
            plans={(data.individualPlans as Plan[]) ?? []}
            onChange={(plans) => update("individualPlans", plans)}
          />
          <PlanEditor
            label="Couple Plans"
            plans={(data.couplePlans as Plan[]) ?? []}
            onChange={(plans) => update("couplePlans", plans)}
          />
        </>
      );
    }

    // Testimonials section
    if (page === "home" && section === "testimonials") {
      return (
        <ArrayField
          label="Testimonials"
          items={(data.testimonials as Record<string, unknown>[]) ?? []}
          fields={[
            { key: "name", label: "Name" },
            { key: "photo", label: "Photo URL" },
            { key: "rating", label: "Rating (1-5)", type: "number" },
            { key: "text", label: "Review Text", type: "textarea" },
            { key: "time", label: "Time (e.g. '7 months ago')" },
          ]}
          onChange={(items) => update("testimonials", items)}
        />
      );
    }

    // FAQ section
    if (page === "home" && section === "faq") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Section Number" value={String(data.sectionNumber ?? "")} onChange={(v) => update("sectionNumber", v)} />
            <TextField label="Section Label" value={String(data.sectionLabel ?? "")} onChange={(v) => update("sectionLabel", v)} />
          </div>
          <TextField label="Headline" value={String(data.headline ?? "")} onChange={(v) => update("headline", v)} />
          <TextField label="Description" value={String(data.description ?? "")} onChange={(v) => update("description", v)} multiline />
          <TextField label="Contact CTA Text" value={String(data.contactCtaText ?? "")} onChange={(v) => update("contactCtaText", v)} />
          <ArrayField
            label="FAQ Items"
            items={(data.faqs as Record<string, unknown>[]) ?? []}
            fields={[
              { key: "question", label: "Question" },
              { key: "answer", label: "Answer", type: "textarea" },
            ]}
            onChange={(items) => update("faqs", items)}
          />
        </>
      );
    }

    // CTA section
    if (page === "home" && section === "cta") {
      return (
        <>
          <TextField label="Headline" value={String(data.headline ?? "")} onChange={(v) => update("headline", v)} />
          <TextField label="Highlight Word (gradient)" value={String(data.highlightWord ?? "")} onChange={(v) => update("highlightWord", v)} />
          <TextField label="Description" value={String(data.description ?? "")} onChange={(v) => update("description", v)} multiline />
          <TextField label="CTA Text" value={String(data.ctaText ?? "")} onChange={(v) => update("ctaText", v)} />
          <TextField label="CTA Link" value={String(data.ctaLink ?? "")} onChange={(v) => update("ctaLink", v)} />
        </>
      );
    }

    // Careers header
    if (page === "careers" && section === "header") {
      return (
        <>
          <TextField label="Headline" value={String(data.headline ?? "")} onChange={(v) => update("headline", v)} />
          <TextField label="Description" value={String(data.description ?? "")} onChange={(v) => update("description", v)} multiline />
        </>
      );
    }

    // Header (navigation)
    if (page === "global" && section === "header") {
      return (
        <ArrayField
          label="Navigation Links"
          items={(data.navLinks as Record<string, unknown>[]) ?? []}
          fields={[
            { key: "label", label: "Label" },
            { key: "href", label: "URL" },
          ]}
          onChange={(items) => update("navLinks", items)}
        />
      );
    }

    // Footer
    if (page === "global" && section === "footer") {
      return (
        <>
          <TextField label="Description" value={String(data.description ?? "")} onChange={(v) => update("description", v)} multiline />
          <TextField label="Operating Hours" value={String(data.hours ?? "")} onChange={(v) => update("hours", v)} />
          <TextField label="Brand Text" value={String(data.brandText ?? "")} onChange={(v) => update("brandText", v)} />
          <div className="grid grid-cols-3 gap-4">
            <TextField label="CTA Prefix" value={String(data.ctaPrefix ?? "")} onChange={(v) => update("ctaPrefix", v)} />
            <TextField label="CTA Text" value={String(data.ctaText ?? "")} onChange={(v) => update("ctaText", v)} />
            <TextField label="CTA Link" value={String(data.ctaLink ?? "")} onChange={(v) => update("ctaLink", v)} />
          </div>
          {((data.linkGroups as Array<{ title: string; links: { label: string; href: string }[] }>) ?? []).map((group, groupIndex) => (
            <div key={groupIndex} className="border border-zinc-800 rounded-lg p-4 space-y-3 bg-zinc-900/30">
              <TextField
                label={`Link Group ${groupIndex + 1} Title`}
                value={group.title}
                onChange={(v) => {
                  const groups = [...(data.linkGroups as typeof group[])];
                  groups[groupIndex] = { ...groups[groupIndex], title: v };
                  update("linkGroups", groups);
                }}
              />
              <ArrayField
                label="Links"
                items={group.links}
                fields={[
                  { key: "label", label: "Label" },
                  { key: "href", label: "URL" },
                ]}
                onChange={(items) => {
                  const groups = [...(data.linkGroups as typeof group[])];
                  groups[groupIndex] = { ...groups[groupIndex], links: items as typeof group.links };
                  update("linkGroups", groups);
                }}
              />
            </div>
          ))}
        </>
      );
    }

    // Fallback: render all string fields
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === "string") {
        return <TextField key={key} label={key} value={value} onChange={(v) => update(key, v)} />;
      }
      return null;
    });
  };

  return (
    <div className="space-y-4">
      {renderFields()}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-6 py-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Saved successfully!</span>}
      </div>
    </div>
  );
}
