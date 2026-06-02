import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Contentful asset CDN — all delivered images/posters live here.
      { protocol: "https", hostname: "images.ctfassets.net" },
      // Placeholder host used only by the /component-preview demo route.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
