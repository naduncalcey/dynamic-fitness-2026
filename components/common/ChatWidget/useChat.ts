"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Conversation state + streaming transport for the chat widget. Talks to the
 * same-origin /api/chat SSE endpoint, appending text deltas to the in-progress
 * assistant message so the reply "types in". History is ephemeral (component
 * state) and cleared on reload.
 */

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
export type ChatStatus = "idle" | "streaming" | "error";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const nextId = () => `m${++idRef.current}`;

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
  }, []);

  const run = useCallback(async (history: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("streaming");

    // Placeholder assistant message we stream tokens into.
    const assistantId = nextId();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    const appendToAssistant = (text: string) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + text } : m))
      );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      // Non-streaming error responses (400/429/500) come back as JSON.
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        appendToAssistant(data.error ?? "");
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let errored = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const line = event.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            const obj = JSON.parse(line.slice(5).trim()) as { type: string; text?: string };
            if (obj.type === "token" && obj.text) appendToAssistant(obj.text);
            else if (obj.type === "error") errored = true;
          } catch {
            // ignore malformed frame
          }
        }
      }

      setStatus(errored ? "error" : "idle");
    } catch (err) {
      if (controller.signal.aborted) return; // user closed / resent — not an error
      console.error("Chat: stream failed", err);
      setStatus("error");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  /** Send a new user message. */
  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "streaming") return;
      const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed };
      const history = [...messages, userMsg];
      setMessages(history);
      void run(history);
    },
    [messages, status, run]
  );

  /** Retry after an error: drop the failed assistant turn and resend. */
  const retry = useCallback(() => {
    if (status === "streaming") return;
    let history = messages;
    if (history[history.length - 1]?.role === "assistant") history = history.slice(0, -1);
    if (!history.length) return;
    setMessages(history);
    void run(history);
  }, [messages, status, run]);

  return { messages, status, send, retry, stop };
}
