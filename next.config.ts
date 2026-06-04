import type { NextConfig } from "next";

/**
 * Security headers applied to every route. These harden the site against
 * common attacks (clickjacking, MIME-sniffing, protocol downgrade, referrer
 * leakage) and map to BestWeb.LK's "updated modules to enhance security".
 *
 * Note on CSP: only `frame-ancestors` is set. A full Content-Security-Policy
 * (script-src/default-src) would need careful allow-listing for Next.js inline
 * runtime scripts, the Cloudflare Turnstile widget, the WebGL hero background,
 * and the BestWeb badge — easy to get wrong and break the site. `frame-ancestors`
 * is enforced on its own and restricts only who may embed us (clickjacking),
 * leaving all other resource loading unrestricted, so it is safe to ship now.
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
    // Modern clickjacking protection: only this origin may frame the site.
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'",
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
  images: {
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
