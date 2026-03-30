import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { allDefaults } from "@/lib/content-defaults";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const section = searchParams.get("section");

  if (!isSupabaseConfigured) {
    if (page && section) {
      return NextResponse.json({ content: allDefaults[page]?.[section] ?? null });
    }
    // Return all content grouped by page
    return NextResponse.json({ content: allDefaults });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not available" }, { status: 500 });
  }

  if (page && section) {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("page", page)
      .eq("section", section)
      .single();

    if (error) {
      // Fall back to defaults
      return NextResponse.json({ content: allDefaults[page]?.[section] ?? null });
    }
    return NextResponse.json({ content: data.content });
  }

  // Return all content
  const { data, error } = await supabase
    .from("site_content")
    .select("page, section, content, updated_at")
    .order("page")
    .order("section");

  if (error) {
    return NextResponse.json({ content: allDefaults });
  }

  return NextResponse.json({ content: data });
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not available" }, { status: 500 });
  }

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { page, section, content } = body;

  if (!page || !section || !content) {
    return NextResponse.json({ error: "Missing page, section, or content" }, { status: 400 });
  }

  const { error } = await supabase
    .from("site_content")
    .upsert(
      { page, section, content, updated_at: new Date().toISOString() },
      { onConflict: "page,section" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
