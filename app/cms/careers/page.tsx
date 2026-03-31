"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import CMSHeader from "@/components/cms/cms-header";
import CMSSidebar from "@/components/cms/cms-sidebar";
import type { CareerListing } from "@/lib/content-types";

export default function CMSCareers() {
  const [listings, setListings] = useState<CareerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchListings = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("career_listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setListings(data as CareerListing[]);
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        router.push("/cms");
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/cms");
        return;
      }
      fetchListings();
    };
    checkAuth();
  }, [router]);

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase
      .from("career_listings")
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: !currentActive } : l))
    );
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing and all its applications?")) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.from("career_listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <>
      <CMSHeader />
      <div className="flex">
        <CMSSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-white mb-1">
                  Career Listings
                </h1>
                <p className="text-sm text-zinc-400">
                  Create and manage job postings.
                </p>
              </div>
              <a
                href="/cms/careers/new"
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                + New Listing
              </a>
            </div>

            {loading ? (
              <div className="text-zinc-500 text-sm">Loading...</div>
            ) : listings.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-500 text-sm">No career listings yet.</p>
                <a
                  href="/cms/careers/new"
                  className="text-red-400 hover:text-red-300 text-sm mt-2 inline-block"
                >
                  Create your first listing
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-white truncate">
                            {listing.title}
                          </h3>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              listing.is_active
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                            }`}
                          >
                            {listing.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                          <span>{listing.type}</span>
                          <span>{listing.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/cms/careers/${listing.id}/applications`}
                          className="text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                        >
                          Applications
                        </a>
                        <a
                          href={`/cms/careers/${listing.id}`}
                          className="text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => toggleActive(listing.id, listing.is_active)}
                          className="text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                        >
                          {listing.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
