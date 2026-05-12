import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const { formId, responses } = await req.json();

    if (!formId) {
      return NextResponse.json({ error: "Missing formId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("alley_applications")
      .insert({
        form_id: formId,
        responses,
        status: "pending",
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Submit application error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/forms/apply failed:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}