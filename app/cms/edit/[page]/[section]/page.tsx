"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { allDefaults } from "@/lib/content-defaults";
import CMSHeader from "@/components/cms/cms-header";
import CMSSidebar from "@/components/cms/cms-sidebar";
import SectionForm from "@/components/cms/section-form";

const sectionLabels: Record<string, Record<string, string>> = {
  home: {
    hero: "Hero Section",
    about: "About Section",
    pricing: "Pricing Section",
    testimonials: "Testimonials",
    faq: "FAQ Section",
    cta: "Call to Action",
  },
  careers: {
    header: "Careers Header",
  },
  global: {
    header: "Navigation",
    footer: "Footer",
  },
};

export default function EditSection() {
  const params = useParams();
  const router = useRouter();
  const page = params.page as string;
  const section = params.section as string;

  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        router.push("/cms");
        return;
      }

      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/cms");
        return;
      }

      // Fetch content from Supabase, fall back to defaults
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("page", page)
        .eq("section", section)
        .single();

      if (data?.content) {
        setContent(data.content as Record<string, unknown>);
      } else {
        setContent((allDefaults[page]?.[section] as Record<string, unknown>) ?? {});
      }
      setLoading(false);
    };
    init();
  }, [page, section, router]);

  const handleSave = async (updatedContent: Record<string, unknown>) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("site_content")
      .upsert(
        {
          page,
          section,
          content: updatedContent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "page,section" }
      );

    if (error) {
      alert("Failed to save: " + error.message);
    }
  };

  const label = sectionLabels[page]?.[section] ?? `${page}/${section}`;

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

  return (
    <>
      <CMSHeader />
      <div className="flex">
        <CMSSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-3xl">
            <div className="mb-6">
              <a
                href="/cms/dashboard"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                &larr; Back to Dashboard
              </a>
              <h1 className="text-xl font-semibold text-white mt-2">{label}</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Edit the content below and click Save to update the website.
              </p>
            </div>

            {content && (
              <SectionForm
                page={page}
                section={section}
                content={content}
                onSave={handleSave}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
