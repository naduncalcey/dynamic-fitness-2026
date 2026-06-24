"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { useChat } from "./useChat";
import { ChatPanel } from "./ChatPanel";

/**
 * Floating AI support assistant. A launcher button sits bottom-left (opposite
 * the bottom-right BackToTop / BackgroundMusic stack) and toggles a docked chat
 * panel. The conversation lives here (via useChat) so it survives closing and
 * reopening within the page session; it resets on reload.
 */

export function ChatWidget() {
  const t = useLabels();
  const [open, setOpen] = useState(false);
  const { messages, status, send, retry, stop } = useChat();

  const close = () => {
    stop(); // abort any in-flight stream to save cost; history is retained
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={t("chat.launch")}
        aria-expanded={open}
        className="group fixed bottom-6 left-6 z-30 flex h-14 cursor-pointer items-center overflow-hidden rounded-full border border-white/15 bg-[var(--cta-surface)] text-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors hover:border-[var(--cta-red-border)] hover:text-white"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center">
          {open ? (
            <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          ) : (
            <MessageCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          )}
        </span>
        {/* Expands on hover/focus to reveal the label. Hidden while the panel is
            open (the icon becomes a close button). Decorative — the button's
            aria-label already names it. */}
        {!open ? (
          <span
            aria-hidden
            className="max-w-0 whitespace-nowrap pr-0 text-sm font-medium opacity-0 transition-all duration-300 ease-out group-hover:max-w-[180px] group-hover:pr-5 group-hover:opacity-100 group-focus-visible:max-w-[180px] group-focus-visible:pr-5 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            {t("chat.launch")}
          </span>
        ) : null}
      </button>

      {open ? (
        <ChatPanel onClose={close} messages={messages} status={status} send={send} retry={retry} />
      ) : null}
    </>
  );
}

export default ChatWidget;
