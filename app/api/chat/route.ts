import { NextResponse } from "next/server";
import { getKnowledgeBase } from "@/lib/chat/knowledge";
import { buildSystemInstruction, MAX_HISTORY_MESSAGES, MAX_USER_CHARS } from "@/lib/chat/prompt";
import { streamGemini, type ChatTurn } from "@/lib/chat/gemini";
import { checkRateLimit, clientIp } from "@/lib/chat/rateLimit";

/**
 * AI support chatbot endpoint. Streams a Gemini 2.5 Flash reply as Server-Sent
 * Events. The model is grounded on the site's own content (see lib/chat/prompt)
 * and may only answer from it. Mirrors the other /api routes: nodejs runtime,
 * early 500 on missing config, honeypot, and a `{ ok:false, error }` JSON shape
 * for the non-streaming error paths.
 */

export const runtime = "nodejs";

type IncomingMessage = { role?: unknown; content?: unknown };

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  Connection: "keep-alive",
} as const;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Chat: missing GEMINI_API_KEY");
    return NextResponse.json(
      { ok: false, error: "Chat is not configured. Please try again later." },
      { status: 500 }
    );
  }

  let body: { messages?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields; humans don't. Accept silently, do nothing.
  if (typeof body.company === "string" && body.company.trim()) {
    return new Response(`data: ${JSON.stringify({ type: "done" })}\n\n`, { headers: SSE_HEADERS });
  }

  // Rate limit per IP.
  if (!checkRateLimit(clientIp(request.headers)).ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // Validate + normalize the conversation.
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ ok: false, error: "No messages provided." }, { status: 400 });
  }

  const turns: ChatTurn[] = [];
  for (const m of body.messages as IncomingMessage[]) {
    const content = typeof m?.content === "string" ? m.content.trim() : "";
    if (!content) continue;
    if (content.length > MAX_USER_CHARS) {
      return NextResponse.json(
        { ok: false, error: `Message is too long (max ${MAX_USER_CHARS} characters).` },
        { status: 400 }
      );
    }
    // Map the client roles to Gemini roles; anything else is treated as a user turn.
    turns.push({ role: m?.role === "assistant" || m?.role === "model" ? "model" : "user", text: content });
  }

  if (turns.length === 0 || turns[turns.length - 1]!.role !== "user") {
    return NextResponse.json({ ok: false, error: "No question to answer." }, { status: 400 });
  }

  // Keep only the most recent turns to bound token cost.
  const contents = turns.slice(-MAX_HISTORY_MESSAGES);

  const kb = await getKnowledgeBase();
  const systemInstruction = buildSystemInstruction(kb);

  const stream = await streamGemini({
    apiKey,
    systemInstruction,
    contents,
    signal: request.signal,
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
