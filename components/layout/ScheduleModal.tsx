"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";

/**
 * Opening-hours popup for the footer "Time Schedule" link. Frontend-only by
 * design (no Contentful entry). The hours below mirror `BUSINESS.hours` in
 * lib/seo.ts — the single source of truth for the LocalBusiness structured
 * data — so update both together if the gym's hours ever change.
 */

type ScheduleRow = { day: string; hours: string };

const TITLE_ID = "schedule-modal-title";

export function ScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [show, setShow] = useState(false);
  const t = useLabels();
  const schedule: ScheduleRow[] = [
    { day: t("schedule.weekdays"), hours: t("schedule.weekdaysHours") },
    { day: t("schedule.sunday"), hours: t("schedule.sundayHours") },
  ];

  // Drive the entrance transition on the frame after mount.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setShow(true));
    return () => {
      cancelAnimationFrame(id);
      setShow(false);
    };
  }, [open]);

  // Escape to close, focus the close button on open, lock body scroll, keep a
  // minimal focus trap, and restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0b] text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-200 ${
          show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 id={TITLE_ID} className="text-lg font-medium tracking-tight">
            {t("schedule.title")}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("schedule.close")}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y divide-white/10">
            {schedule.map((row) => (
              <tr key={row.day} className="transition-colors hover:bg-white/[0.02]">
                <th scope="row" className="px-6 py-4 text-left font-normal text-gray-300">
                  {row.day}
                </th>
                <td className="px-6 py-4 text-right font-mono text-white/90">{row.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="border-t border-white/10 px-6 py-4 text-xs text-white/60">
          {t("schedule.timezone")}
        </p>
      </div>
    </div>,
    document.body
  );
}

export default ScheduleModal;
