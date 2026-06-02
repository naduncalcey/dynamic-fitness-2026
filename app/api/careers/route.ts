import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Careers application endpoint. Accepts a multipart form (applicant fields +
 * CV file), validates it, and emails the application — with the CV as an
 * attachment — to CAREERS_EMAIL_TO via Resend. Nothing is stored: the file only
 * passes through memory into the email.
 */

export const runtime = "nodejs";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CAREERS_EMAIL_TO;
  const from = process.env.CAREERS_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.error("Careers: missing RESEND_API_KEY or CAREERS_EMAIL_TO");
    return NextResponse.json(
      { ok: false, error: "Email is not configured. Please try again later." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form submission." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields; humans don't.
  if (typeof form.get("company") === "string" && form.get("company")) {
    return NextResponse.json({ ok: true }); // silently accept, send nothing
  }

  // Cloudflare Turnstile CAPTCHA — verify the token server-side (when configured).
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = String(form.get("cf-turnstile-response") ?? "");
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Please complete the captcha." },
        { status: 400 }
      );
    }
    try {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ secret: turnstileSecret, response: token }),
        }
      );
      const outcome = (await verifyRes.json()) as { success?: boolean };
      if (!outcome.success) {
        return NextResponse.json(
          { ok: false, error: "Captcha verification failed. Please try again." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "Couldn't verify the captcha. Please try again." },
        { status: 502 }
      );
    }
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const position = String(form.get("position") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const cv = form.get("cv");

  if (!name || !email || !position) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and position are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ ok: false, error: "Please attach your CV." }, { status: 400 });
  }
  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json({ ok: false, error: "CV must be 5 MB or smaller." }, { status: 400 });
  }
  if (cv.type && !ALLOWED_CV_TYPES.includes(cv.type)) {
    return NextResponse.json(
      { ok: false, error: "CV must be a PDF or Word document." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await cv.arrayBuffer());

  const html = `
    <h2>New job application</h2>
    <p><strong>Position:</strong> ${escapeHtml(position)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
    ${message ? `<p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>` : ""}
    <p style="color:#888;font-size:12px">CV attached: ${escapeHtml(cv.name)}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New application — ${position} — ${name}`,
      html,
      attachments: [{ filename: cv.name || "cv", content: buffer }],
    });
    if (error) {
      console.error("Careers: Resend error", error);
      return NextResponse.json(
        { ok: false, error: "Couldn't send your application. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Careers: send failed", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't send your application. Please try again." },
      { status: 500 }
    );
  }
}
