import { GEMINI_MODEL } from "./prompt";

/**
 * Gemini 2.5 Flash REST client. Calls the streaming endpoint server-side and
 * transforms its SSE into a simple framed stream for the browser:
 *
 *   data: {"type":"token","text":"…"}\n\n   — an incremental text delta
 *   data: {"type":"error"}\n\n              — generation failed / was blocked
 *   data: {"type":"done"}\n\n               — end of message
 *
 * The API key lives only here (server-side); the browser never sees it and only
 * talks to same-origin /api/chat.
 */

export type ChatTurn = { role: "user" | "model"; text: string };

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const FALLBACK =
  "Sorry, I'm having trouble responding right now. Please try again, or contact Dynamic Fitness on +94 77 240 3117.";
const BUSY =
  "I'm getting a lot of questions right now — please try again in a moment, or contact Dynamic Fitness on +94 77 240 3117.";

const encoder = new TextEncoder();
const frame = (obj: unknown) => encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);

/** A one-shot stream that emits a friendly fallback line, then done. */
function errorStream(message: string = FALLBACK): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(frame({ type: "token", text: message }));
      controller.enqueue(frame({ type: "error" }));
      controller.enqueue(frame({ type: "done" }));
      controller.close();
    },
  });
}

type GeminiChunk = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
};

/** Pull the text delta out of one Gemini SSE payload. */
function extractText(json: GeminiChunk): string {
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("");
}

export async function streamGemini({
  apiKey,
  systemInstruction,
  contents,
  signal,
}: {
  apiKey: string;
  systemInstruction: string;
  contents: ChatTurn[];
  signal?: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> {
  let upstream: Response;
  try {
    upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: contents.map((c) => ({ role: c.role, parts: [{ text: c.text }] })),
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1024,
          // Disable "thinking": 2.5 Flash otherwise spends the output budget on
          // hidden reasoning tokens (→ truncated/empty answers). The bot just
          // reads from the supplied KB, so thinking adds cost without value.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal,
    });
  } catch (err) {
    console.error("Chat: Gemini request failed", err);
    return errorStream();
  }

  if (!upstream.ok || !upstream.body) {
    console.error("Chat: Gemini returned", upstream.status, await upstream.text().catch(() => ""));
    // 429 = quota/rate limit → tell the visitor we're busy rather than broken.
    return errorStream(upstream.status === 429 ? BUSY : FALLBACK);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let emittedAny = false;
  let blocked = false;

  // Parse one SSE event block (its `data:` line) and enqueue any text delta.
  const handleEvent = (event: string, controller: ReadableStreamDefaultController<Uint8Array>) => {
    for (const line of event.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let json: GeminiChunk;
      try {
        json = JSON.parse(payload) as GeminiChunk;
      } catch {
        continue;
      }
      if (json.promptFeedback?.blockReason) blocked = true;
      const text = extractText(json);
      if (text) {
        emittedAny = true;
        controller.enqueue(frame({ type: "token", text }));
      }
    }
  };

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          // Flush any trailing partial event, then finish.
          if (buffer.trim()) handleEvent(buffer, controller);
          // Ended with no usable text (e.g. safety block) → send a fallback.
          if (!emittedAny) {
            controller.enqueue(frame({ type: "token", text: FALLBACK }));
            if (blocked) controller.enqueue(frame({ type: "error" }));
          }
          controller.enqueue(frame({ type: "done" }));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        // SSE events are separated by a blank line (Gemini uses CRLF).
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";
        for (const event of events) handleEvent(event, controller);
      } catch (err) {
        console.error("Chat: stream read failed", err);
        if (!emittedAny) controller.enqueue(frame({ type: "token", text: FALLBACK }));
        controller.enqueue(frame({ type: "error" }));
        controller.enqueue(frame({ type: "done" }));
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}
