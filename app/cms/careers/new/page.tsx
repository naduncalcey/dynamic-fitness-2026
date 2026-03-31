"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import CMSHeader from "@/components/cms/cms-header";
import CMSSidebar from "@/components/cms/cms-sidebar";
import CareerForm from "@/components/cms/career-form";

export default function NewCareerListing() {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { router.push("/cms"); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/cms"); return; }
      setAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  if (!authenticated) {
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
          <div className="max-w-3xl">
            <div className="mb-6">
              <a href="/cms/careers" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                &larr; Back to Listings
              </a>
              <h1 className="text-xl font-semibold text-white mt-2">New Career Listing</h1>
            </div>
            <CareerForm />
          </div>
        </main>
      </div>
    </>
  );
}
