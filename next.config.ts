import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // The hero and banners render at quality 90, as they did as local imports.
    qualities: [70, 75, 90],
  },
};

export default nextConfig;
