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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const status = body?.status as string;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: appRow, error: appErr } = await supabase
      .from("alley_applications")
      .select("id, organizer_id")
      .eq("id", id)
      .single();

    if (appErr || !appRow) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (
      process.env.NODE_ENV === "development" &&
      appRow.organizer_id !== DEV_ORGANIZER_ID
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("alley_applications")
      .update({ status })
      .eq("id", id)
      .select("id,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ application: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}