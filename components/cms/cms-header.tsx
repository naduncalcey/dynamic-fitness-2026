"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function CMSHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/cms");
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/cms/dashboard" className="text-sm font-semibold text-white">
            Dynamic Fitness CMS
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            View Site &rarr;
          </a>
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
