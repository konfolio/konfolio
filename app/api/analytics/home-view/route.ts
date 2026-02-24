import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COOLDOWN_SECONDS = 5;

export async function POST(req: Request) {
  try {
    const { viewerId } = await req.json();

    if (!viewerId || typeof viewerId !== "string") {
      return NextResponse.json({ error: "viewerId required" }, { status: 400 });
    }

    // 1) Read the logged-in user (if any) from cookies
    const cookieStore = await cookies();

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // In a route handler, we can set cookies if needed
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: userData } = await supabaseAuth.auth.getUser();
    const userId = userData.user?.id ?? null;

    const page = "home";

    // 2) Cooldown gate check 
    const gateRes = await supabaseAdmin
      .from("site_view_gates")
      .select("last_counted_at")
      .eq("page", page)
      .eq("viewer_id", viewerId)
      .maybeSingle();

    const last = gateRes.data?.last_counted_at
      ? new Date(gateRes.data.last_counted_at).getTime()
      : null;

    const now = Date.now();
    const withinCooldown =
      last !== null && now - last < COOLDOWN_SECONDS * 1000;

    if (withinCooldown) {
      return NextResponse.json({ counted: false });
    }

    // 3) Update gate + insert view event
    const upsertGate = await supabaseAdmin
      .from("site_view_gates")
      .upsert(
        {
          page,
          viewer_id: viewerId,
          last_counted_at: new Date().toISOString(),
        },
        { onConflict: "page,viewer_id" }
      );

    if (upsertGate.error) {
      return NextResponse.json(
        { error: upsertGate.error.message },
        { status: 500 }
      );
    }

    const ins = await supabaseAdmin.from("site_views").insert({
      page,
      viewer_id: viewerId,
      user_id: userId, 
    });

    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }

    return NextResponse.json({ counted: true, userId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}