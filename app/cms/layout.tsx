import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS - Dynamic Fitness",
  robots: "noindex, nofollow",
};

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {children}
    </div>
  );
}
