import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey);
}

const DEV_ORGANIZER_ID = "a0d1b45e-e482-4eba-ba34-54a4c88d33d4";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const supabase = createAdminClient();

    const { data: form, error } = await supabase
      .from("alley_forms")
      .select("id, organizer_id, title, status")
      .eq("id", formId)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (
      process.env.NODE_ENV === "development" &&
      form.organizer_id !== DEV_ORGANIZER_ID
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(form);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}