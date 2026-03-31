"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import CMSHeader from "@/components/cms/cms-header";
import CMSSidebar from "@/components/cms/cms-sidebar";
import type { CareerApplication } from "@/lib/content-types";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  reviewed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  shortlisted: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [listingTitle, setListingTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { router.push("/cms"); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/cms"); return; }

      const [{ data: listing }, { data: apps }] = await Promise.all([
        supabase.from("career_listings").select("title").eq("id", listingId).single(),
        supabase
          .from("career_applications")
          .select("*")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false }),
      ]);

      if (listing) setListingTitle(listing.title);
      if (apps) setApplications(apps as CareerApplication[]);
      setLoading(false);
    };
    init();
  }, [listingId, router]);

  const updateStatus = async (appId: string, status: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.from("career_applications").update({ status }).eq("id", appId);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  const downloadResume = async (path: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <>
      <CMSHeader />
      <div className="flex">
        <CMSSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl">
            <div className="mb-6">
              <a href="/cms/careers" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                &larr; Back to Listings
              </a>
              <h1 className="text-xl font-semibold text-white mt-2">
                Applications{listingTitle ? `: ${listingTitle}` : ""}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {loading ? "Loading..." : `${applications.length} application${applications.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {!loading && applications.length === 0 && (
              <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-500 text-sm">No applications yet.</p>
              </div>
            )}

            {!loading && applications.length > 0 && (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-zinc-800 rounded-lg p-5 bg-zinc-900/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-white">
                            {app.name}
                          </h3>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                              statusColors[app.status] ?? statusColors.new
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-zinc-500">
                          <a href={`mailto:${app.email}`} className="hover:text-zinc-300 transition-colors">
                            {app.email}
                          </a>
                          {app.phone && <span>{app.phone}</span>}
                          <span>
                            {new Date(app.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {app.message && (
                          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                            {app.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {app.resume_url && (
                          <button
                            onClick={() => downloadResume(app.resume_url!)}
                            className="text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                          >
                            Resume
                          </button>
                        )}
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-2 py-1.5 focus:outline-none focus:border-zinc-600"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
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
