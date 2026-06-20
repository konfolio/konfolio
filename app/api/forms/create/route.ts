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
    const isRecurring = Boolean(body?.isRecurring);
    const recurrenceText = body?.recurrenceText?.trim() || null;

    const startDate = isRecurring ? null : body?.startDate || null;
    const endDate = isRecurring ? null : body?.endDate || null;
    const location = body?.location?.trim() || null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (isRecurring && !recurrenceText) {
      return NextResponse.json(
        { error: "Recurrence text is required" },
        { status: 400 }
      );
    }

    if (!isRecurring && (!startDate || !endDate)) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("alley_forms")
      .insert({
        organizer_id: user.id,
        title,

        // Canonical event columns
        event_date_start: startDate,
        event_date_end: endDate,
        event_address: location,

        // Regular recurrence
        is_recurring: isRecurring,
        recurrence_text: isRecurring ? recurrenceText : null,

        status: "draft",
        fields: [],

        // Old compatibility columns
        start_date: startDate,
        end_date: endDate,
        location,
        is_open: false,
      })
      .select(`
        id,
        organizer_id,
        title,
        status,
        event_date_start,
        event_date_end,
        event_address,
        is_recurring,
        recurrence_text
      `)
      .single();

    if (error) {
      console.error("Create form error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      formId: data.id,
      form: data,
    });
  } catch (err) {
    console.error("POST /api/forms/create failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}