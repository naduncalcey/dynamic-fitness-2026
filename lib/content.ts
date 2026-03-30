import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { allDefaults } from "./content-defaults";

export async function getContent<T>(page: string, section: string): Promise<T> {
  const fallback = allDefaults[page]?.[section] as T;

  if (!isSupabaseConfigured) return fallback;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("page", page)
      .eq("section", section)
      .single();

    if (error || !data) return fallback;
    return data.content as T;
  } catch {
    return fallback;
  }
}

export async function getAllPageContent(page: string): Promise<Record<string, unknown>> {
  const defaults = allDefaults[page] ?? {};

  if (!isSupabaseConfigured) return defaults;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return defaults;

    const { data, error } = await supabase
      .from("site_content")
      .select("section, content")
      .eq("page", page);

    if (error || !data) return defaults;

    const result = { ...defaults };
    for (const row of data) {
      result[row.section] = row.content;
    }
    return result;
  } catch {
    return defaults;
  }
}
