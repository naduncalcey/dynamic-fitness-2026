"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";

/**
 * Cursor-following tooltip that wraps an image (ported from the old About
 * section). Shows a white pill with a red marker icon that tracks the cursor;
 * desktop only. Pair with `cursor-none` on the wrapped element.
 */

type CursorTooltipProps = {
  label: string;
  children: ReactNode;
};

export function CursorTooltip({ label, children }: CursorTooltipProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="relative"
    >
      {children}
      <div
        className="pointer-events-none absolute z-30 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-black shadow-lg transition-opacity duration-200 md:flex"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -120%)",
          opacity: visible ? 1 : 0,
        }}
      >
        <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
        {label}
      </div>
    </div>
  );
}

export default CursorTooltip;
