import Link from "next/link";

/**
 * Branded 404. A server component so its content is in the server-rendered HTML
 * (crawler-visible, no hydration flash). Rendered inside the root layout, so the
 * Header/Footer wrap it. English copy: the not-found boundary can't read the URL
 * locale without forcing dynamic rendering, and this is an edge page.
 */

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center border-t border-white/20 bg-black px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <p
          className="select-none text-[120px] font-bold leading-none tracking-tighter sm:text-[160px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,90,90,0.35) 0%, rgba(255,255,255,0.04) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          aria-hidden
        >
          404
        </p>
        <p className="-mt-4 text-xs font-medium uppercase tracking-[0.25em] text-red-500">
          Error 404
        </p>
        <h1 className="mt-4 text-3xl font-normal tracking-tight text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-red-500 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-600"
          >
            Back to home
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-white"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </main>
  );
}
