"use client";

import { usePathname } from "next/navigation";

const sections = {
  home: [
    { key: "hero", label: "Hero" },
    { key: "about", label: "About" },
    { key: "pricing", label: "Pricing" },
    { key: "testimonials", label: "Testimonials" },
    { key: "faq", label: "FAQ" },
    { key: "cta", label: "Call to Action" },
  ],
  careers: [
    { key: "header", label: "Careers Header" },
    { key: "listings", label: "Job Listings", href: "/cms/careers" },
  ],
  global: [
    { key: "header", label: "Navigation" },
    { key: "footer", label: "Footer" },
  ],
};

const pageLabels: Record<string, string> = {
  home: "Home Page",
  careers: "Careers Page",
  global: "Global Components",
};

export default function CMSSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 min-h-[calc(100vh-56px)] p-4 hidden lg:block">
      <nav className="space-y-6">
        {Object.entries(sections).map(([page, items]) => (
          <div key={page}>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2">
              {pageLabels[page]}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const href = ("href" in item && item.href) ? item.href : `/cms/edit/${page}/${item.key}`;
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={item.key}>
                    <a
                      href={href}
                      className={`block px-2 py-1.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
