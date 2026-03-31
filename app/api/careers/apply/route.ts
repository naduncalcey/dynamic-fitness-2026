import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const formData = await request.formData();

  const listing_id = formData.get("listing_id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;
  const resume = formData.get("resume") as File | null;

  if (!listing_id || !name || !email) {
    return NextResponse.json(
      { error: "Name, email, and listing are required" },
      { status: 400 }
    );
  }

  let resume_url: string | null = null;

  if (resume && resume.size > 0) {
    const ext = resume.name.split(".").pop();
    const path = `${listing_id}/${Date.now()}_${name.replace(/\s+/g, "_")}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, resume);

    if (!uploadError) {
      resume_url = path;
    }
  }

  const { error } = await supabase.from("career_applications").insert({
    listing_id,
    name,
    email,
    phone: phone || "",
    message: message || "",
    resume_url,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
