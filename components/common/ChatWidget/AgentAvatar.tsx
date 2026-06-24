import Image from "next/image";

/**
 * Agent avatar — a real photo of the support agent, shown as a round image.
 * Served through next/image (optimized + AVIF/WebP). Size is controlled by the
 * caller via `className` (set h-/w-); the image fills the circle via `object-cover`.
 * Decorative: the agent's name is conveyed by adjacent text / the button label,
 * so the wrapper is aria-hidden and the alt is empty.
 */
export function AgentAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/15 ${className ?? ""}`}
    >
      <Image
        src="/assets/images/agent.webp"
        alt=""
        fill
        sizes="48px"
        className="object-cover"
      />
    </span>
  );
}

export default AgentAvatar;
