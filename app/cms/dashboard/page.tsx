"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import CMSHeader from "@/components/cms/cms-header";
import CMSSidebar from "@/components/cms/cms-sidebar";

const sections = {
  home: [
    { key: "hero", label: "Hero Section", description: "Main headline, CTA button, and booking link" },
    { key: "about", label: "About Section", description: "About description, tooltips, and directions link" },
    { key: "pricing", label: "Pricing Section", description: "Membership plans, prices, and features" },
    { key: "testimonials", label: "Testimonials", description: "Customer reviews and ratings" },
    { key: "faq", label: "FAQ Section", description: "Frequently asked questions and answers" },
    { key: "cta", label: "Call to Action", description: "Bottom CTA headline and booking link" },
  ],
  careers: [
    { key: "header", label: "Careers Header", description: "Page title and description text" },
    { key: "listings", label: "Job Listings", description: "Create and manage career openings", href: "/cms/careers" },
  ],
  global: [
    { key: "header", label: "Navigation", description: "Navigation menu links" },
    { key: "footer", label: "Footer", description: "Footer links, hours, and descriptions" },
  ],
};

const pageLabels: Record<string, string> = {
  home: "Home Page",
  careers: "Careers Page",
  global: "Global Components",
};

export default function CMSDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        router.push("/cms");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/cms");
        return;
      }
      setAuthenticated(true);
      setChecking(false);
    };
    checkAuth();
  }, [router]);

  if (checking || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <CMSHeader />
      <div className="flex">
        <CMSSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl">
            <h1 className="text-xl font-semibold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-zinc-400 mb-8">
              Select a section below to edit its content.
            </p>

            <div className="space-y-8">
              {Object.entries(sections).map(([page, items]) => (
                <div key={page}>
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    {pageLabels[page]}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <a
                        key={item.key}
                        href={"href" in item && item.href ? item.href : `/cms/edit/${page}/${item.key}`}
                        className="group block p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
                            {item.label}
                          </h3>
                          <svg
                            className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
