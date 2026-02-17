import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Template = "square" | "portrait";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

function supabaseAuthed(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAuthed(token);

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
  }

  const template: Template = body?.template === "portrait" ? "portrait" : "square";

  // Start with empty content (per spec)
  let content: Record<string, any> = {};

  // Optional autofill from profiles
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "first_name, email, profile_image_url, business_name, location, merch_tags, previous_vends, links"
      )
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (profile) {
      content = {
        displayName: profile.first_name ?? undefined,
        email: profile.email ?? undefined,
        profileImageUrl: profile.profile_image_url ?? undefined,
        businessName: profile.business_name ?? undefined,
        locationText: profile.location ?? undefined,
        merchTags: profile.merch_tags ?? undefined,
        previousVends: profile.previous_vends ?? undefined,
        links: profile.links ?? undefined,
      };

      Object.keys(content).forEach((k) => content[k] === undefined && delete content[k]);
    }
  } catch {
    // ignore autofill failures
  }

  const { data, error } = await supabase
    .from("konfolios")
    .insert({
      user_id: auth.user.id,
      template,
      status: "draft",
      content,
    })
    .select("id, template, status, updated_at, content")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    content: data.content,
  });
}
