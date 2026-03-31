"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import CMSHeader from "@/components/cms/cms-header";
import CMSSidebar from "@/components/cms/cms-sidebar";
import CareerForm from "@/components/cms/career-form";
import type { CareerListing } from "@/lib/content-types";

export default function EditCareerListing() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [listing, setListing] = useState<CareerListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { router.push("/cms"); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/cms"); return; }

      const { data } = await supabase
        .from("career_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setListing(data as CareerListing);
      setLoading(false);
    };
    init();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <CMSHeader />
        <div className="flex">
          <CMSSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="text-zinc-500 text-sm">Loading...</div>
          </main>
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <CMSHeader />
        <div className="flex">
          <CMSSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="text-zinc-500 text-sm">Listing not found.</div>
          </main>
        </div>
      </>
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
              <h1 className="text-xl font-semibold text-white mt-2">Edit: {listing.title}</h1>
            </div>
            <CareerForm listing={listing} />
          </div>
        </main>
      </div>
    </>
  );
}
