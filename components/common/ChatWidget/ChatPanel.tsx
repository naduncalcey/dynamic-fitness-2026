"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";
import { MAX_USER_CHARS } from "@/lib/chat/prompt";
import { AgentAvatar } from "./AgentAvatar";
import type { ChatMessage, ChatStatus } from "./useChat";

/**
 * The chat panel: a non-modal docked popover (full-screen sheet on mobile). The
 * open/close animation, Escape-to-close, and focus handling mirror
 * components/layout/ScheduleModal.tsx. It is non-modal by design — the page
 * stays interactive while chatting — so there's no backdrop or focus trap.
 */

const TITLE_ID = "chat-panel-title";

const SUGGESTION_KEYS = [
  "chat.suggest.pricing",
  "chat.suggest.hours",
  "chat.suggest.classes",
  "chat.suggest.location",
] as const;

type ChatPanelProps = {
  onClose: () => void;
  messages: ChatMessage[];
  status: ChatStatus;
  send: (text: string) => void;
  retry: () => void;
};

function TypingDots({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 py-1" role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="animate-chat-dot h-1.5 w-1.5 rounded-full bg-white/60"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

export function ChatPanel({ onClose, messages, status, send, retry }: ChatPanelProps) {
  const t = useLabels();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState("");

  // Drive the entrance transition on the frame after mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Escape to close, focus the input on open, restore focus to the launcher on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  // Auto-scroll to the latest message as it streams.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  if (typeof document === "undefined") return null;

  const submit = () => {
    if (!draft.trim() || status === "streaming") return;
    send(draft);
    setDraft("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const isEmpty = messages.length === 0;
  const remaining = MAX_USER_CHARS - draft.length;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={TITLE_ID}
      className={`fixed inset-0 z-[70] flex flex-col border border-white/15 bg-[#0b0b0b] text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-200 motion-reduce:transition-none sm:inset-auto sm:bottom-24 sm:left-6 sm:h-[min(70vh,560px)] sm:w-[380px] sm:max-w-[calc(100vw-3rem)] sm:rounded-2xl ${
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } motion-reduce:translate-y-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <AgentAvatar className="h-8 w-8" />
          <h2 id={TITLE_ID} className="text-sm font-medium tracking-tight">
            {t("chat.title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("chat.close")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      {/* Messages */}
      <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="flex h-full flex-col justify-center">
            <AgentAvatar className="mb-3 h-12 w-12" />
            <p className="text-sm text-white/80">{t("chat.greeting")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => send(t(key))}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-left text-xs text-white/80 transition-colors hover:border-[var(--cta-red-border)] hover:text-white"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const streamingEmpty = m.role === "assistant" && m.content === "" && status === "streaming";
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" ? <AgentAvatar className="h-7 w-7" /> : null}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[var(--brand-primary)] text-black"
                      : "rounded-bl-sm border border-white/10 bg-white/[0.04] text-white/90"
                  }`}
                >
                  {streamingEmpty ? <TypingDots label={t("chat.typing")} /> : m.content}
                </div>
              </div>
            );
          })
        )}

        {status === "error" ? (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={retry}
              className="cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-[var(--cta-red-border)] hover:text-white"
            >
              {t("chat.retry")}
            </button>
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form onSubmit={onSubmit} className="border-t border-white/10 px-3 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_USER_CHARS))}
            onKeyDown={onInputKeyDown}
            rows={1}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.placeholder")}
            className="max-h-28 min-h-[40px] flex-1 resize-none rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || status === "streaming"}
            aria-label={t("chat.send")}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-[var(--cta-surface)] text-white/80 backdrop-blur-md transition-colors hover:border-[var(--cta-red-border)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[10px] leading-tight text-white/40">{t("chat.disclaimer")}</p>
          {remaining < 100 ? (
            <span className="shrink-0 text-[10px] text-white/40">{remaining}</span>
          ) : null}
        </div>
      </form>
    </div>,
    document.body
  );
}

export default ChatPanel;
