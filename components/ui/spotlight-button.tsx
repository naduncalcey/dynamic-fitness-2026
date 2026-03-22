"use client";

import { useRef, MouseEvent } from "react";

interface SpotlightButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "red" | "gray";
}

const variants = {
  red: {
    borderColor: "rgba(255,80,80,0.25)",
    beam: "radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,120,120,0.25) 0%, rgba(255,80,80,0.10) 20%, rgba(0,0,0,0.0) 55%)",
  },
  gray: {
    borderColor: "rgba(255,255,255,0.15)",
    beam: "radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 20%, rgba(0,0,0,0.0) 55%)",
  },
};

const SpotlightButton = ({ children, className = "", onClick, variant = "red" }: SpotlightButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const v = variants[variant];

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    buttonRef.current!.style.setProperty("--x", `${x}px`);
    buttonRef.current!.style.setProperty("--y", `${y}px`);
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`group/spot relative inline-flex items-center justify-center px-8 py-[0.9rem] w-fit overflow-hidden rounded-[18px] border bg-[rgba(20,20,20,0.6)] backdrop-blur-md text-[#aaa] text-sm tracking-[0.12em] uppercase transition-colors duration-300 hover:text-white cursor-pointer ${className}`}
      style={{ borderColor: v.borderColor }}
    >
      <div
        ref={beamRef}
        className="absolute inset-0 pointer-events-none opacity-0 group-hover/spot:opacity-100 transition-opacity duration-[350ms] ease-out"
        style={{ background: v.beam }}
      />
      <span className="relative pointer-events-none">{children}</span>
    </button>
  );
};

export default SpotlightButton;
