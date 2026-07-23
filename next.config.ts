import type { NextConfig } from "next";

/**
 * Content-Security-Policy. A full policy that allow-lists every origin the site
 * actually loads in the browser, then denies everything else (`default-src
 * 'self'`). Built from an audit of the codebase:
 *
 *  - script-src   self + Next.js inline bootstrap/JSON-LD (`'unsafe-inline'`),
 *                 Cloudflare Turnstile, the UnicornStudio WebGL runtime
 *                 (jsDelivr), and Google AdSense (googlesyndication /
 *                 doubleclick / adtrafficquality). `'unsafe-eval'` is added in
 *                 dev only (React Fast Refresh needs it); it is NOT shipped to
 *                 production.
 *  - style-src    self + Tailwind/Next inline styles + next/font.
 *  - img-src      Contentful CDN, the BestWeb badge, picsum (preview route),
 *                 plus data:/blob: for inline + optimized images.
 *  - connect-src  Turnstile + UnicornStudio (scene assets).
 *  - frame-src    Turnstile widget, YouTube/Vimeo embeds, Google Maps embed.
 *  - media-src    self (the self-hosted background-music track).
 *  - frame-ancestors / form-action / base-uri / object-src lock down framing,
 *    form posts, <base> hijacking, and plugins.
 *
 * A nonce-based policy is intentionally avoided: every page is statically
 * prerendered (ISR), and per-request nonces would force dynamic rendering and
 * defeat the Full Route Cache. `'unsafe-inline'` for scripts is the accepted
 * trade-off for a fully static Next.js site and is still a large improvement
 * over the previous `frame-ancestors`-only policy.
 */
const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.ctfassets.net https://picsum.photos https://ebadge.bestweb.lk https://assets.unicorn.studio https://storage.googleapis.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://www.google.com",
  "font-src 'self' data:",
  // UnicornStudio fetches its scene JSON + textures from one of these two
  // bases (storage.googleapis.com by default, assets.unicorn.studio in
  // production mode), so both must be reachable for fetch AND image loads.
  "connect-src 'self' https://challenges.cloudflare.com https://cdn.jsdelivr.net https://assets.unicorn.studio https://storage.googleapis.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://csi.gstatic.com",
  "media-src 'self'",
  "frame-src https://challenges.cloudflare.com https://www.youtube.com https://player.vimeo.com https://www.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Security headers applied to every route. These harden the site against
 * common attacks (clickjacking, MIME-sniffing, protocol downgrade, referrer
 * leakage, resource injection) and map to BestWeb.LK's "updated modules to
 * enhance security".
 */
const securityHeaders = [
  {
    // Force HTTPS for two years, including subdomains; eligible for preload.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Stop browsers from MIME-sniffing responses away from their declared type.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Legacy clickjacking protection for older browsers.
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Full Content-Security-Policy (see `contentSecurityPolicy` above):
    // allow-lists every origin the site loads and denies the rest. Includes
    // `frame-ancestors 'self'` for modern clickjacking protection.
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    // Send origin only on cross-origin requests; full URL stays same-origin.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Deny powerful features the site never uses; opt out of FLoC/Topics.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an `X-Powered-By: Next.js` response header.
  poweredByHeader: false,
  images: {
    // Serve AVIF first (≈30% smaller than WebP), then WebP, then the original
    // as a last resort. The optimizer content-negotiates per request from the
    // browser's Accept header, so the hero ships AVIF to phones that support it
    // — the single biggest lever on the 5.4s mobile LCP.
    formats: ["image/avif", "image/webp"],
    // Cache optimized variants at the edge for 31 days (default is 4 hours), so
    // the hero isn't re-encoded on every cold request.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      // Contentful asset CDN — all delivered images/posters live here.
      { protocol: "https", hostname: "images.ctfassets.net" },
      // Placeholder host used only by the /component-preview demo route.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
