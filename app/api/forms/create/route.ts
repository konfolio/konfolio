import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const title = body?.title?.trim();
    const startDate = body?.startDate || null;
    const endDate = body?.endDate || null;
    const location = body?.location?.trim() || null;
    const isRecurring = Boolean(body?.isRecurring);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("alley_forms")
      .insert({
        organizer_id: user.id,
        title,
        start_date: startDate,
        end_date: endDate,
        location,
        is_recurring: isRecurring,
        is_open: true,
      })
      .select("organizer_id")
      .single();

    if (error) {
      console.error("Create form error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ formId: data.organizer_id });
  } catch (err) {
    console.error("POST /api/forms/create failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}