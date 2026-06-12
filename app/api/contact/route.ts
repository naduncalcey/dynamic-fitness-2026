import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Contact enquiry endpoint. Accepts a form submission (name, email, optional
 * phone/subject, message), validates it, and emails the enquiry to
 * CONTACT_EMAIL_TO via Resend. Nothing is stored. Mirrors /api/careers (honeypot
 * + Cloudflare Turnstile verification) but carries no file attachment.
 */

export const runtime = "nodejs";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  // Falls back to the careers inbox/sender so contact works with the same config.
  const to = process.env.CONTACT_EMAIL_TO ?? process.env.CAREERS_EMAIL_TO;
  const from =
    process.env.CONTACT_EMAIL_FROM ?? process.env.CAREERS_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.error("Contact: missing RESEND_API_KEY or CONTACT_EMAIL_TO/CAREERS_EMAIL_TO");
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
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  const html = `
    <h2>New contact enquiry</h2>
    ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
    <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: subject ? `Contact — ${subject} — ${name}` : `New contact enquiry — ${name}`,
      html,
    });
    if (error) {
      console.error("Contact: Resend error", error);
      return NextResponse.json(
        { ok: false, error: "Couldn't send your message. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact: send failed", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't send your message. Please try again." },
      { status: 500 }
    );
  }
}
