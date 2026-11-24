import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const hasStatus = body?.status !== undefined;
    const hasNotes = body?.notes !== undefined;
    const status = body?.status as string;
    const notes = body?.notes as string | null;

    if (hasStatus && !["accepted", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!hasStatus && !hasNotes) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const authSupabase = await createSupabaseServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Only the organizer of this form can update status
    if (appRow.organizer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: { status?: string; organizer_notes?: string | null } = {};
    if (hasStatus) updates.status = status;
    if (hasNotes) updates.organizer_notes = notes;

    const { data, error } = await supabase
      .from("alley_applications")
      .update(updates)
      .eq("id", id)
      .select("id, status, organizer_notes")
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authSupabase = await createSupabaseServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Only the organizer of this form can delete the application
    if (appRow.organizer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("alley_applications")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}