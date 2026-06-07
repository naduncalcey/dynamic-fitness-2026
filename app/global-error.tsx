"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary for failures in the root layout itself (where the
 * normal error.tsx — which renders inside the layout — can't help). It replaces
 * the entire document, so it renders its own <html>/<body> and uses inline
 * styles (globals.css isn't guaranteed here). English-only: a catastrophic
 * fallback that's rarely seen and must not depend on app context.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "#000",
          color: "#ededed",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#ff5a5a",
            }}
          >
            Error
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "2rem", fontWeight: 400 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
            An unexpected error occurred. Please try again.
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: "pointer",
                borderRadius: "9999px",
                border: "none",
                background: "#ff5a5a",
                color: "#fff",
                padding: "10px 24px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Try again
            </button>
            {/* Intentional full-page navigation, not <Link>: in a global error
                state the client router may be broken, so a hard reload is the
                reliable recovery path. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
                padding: "10px 24px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
