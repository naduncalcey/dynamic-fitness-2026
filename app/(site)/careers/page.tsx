export const dynamic = "force-dynamic";

import CareersHeader from "@/components/sections/careers-header";
import CareerListings from "@/components/sections/career-listings";
import { getContent } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";
import type { CareersContent, CareerListing } from "@/lib/content-types";

async function getActiveListings(): Promise<CareerListing[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("career_listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as CareerListing[];
}

export default async function Careers() {
  const [content, listings] = await Promise.all([
    getContent<CareersContent>("careers", "header"),
    getActiveListings(),
  ]);

  return (
    <>
      <CareersHeader content={content} />
      <CareerListings listings={listings} />
    </>
  );
}
