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

type FormField = {
  id?: string;
  type?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  sortOrder?: number;
};

function normalizeFields(fields: FormField[]) {
  return fields.map((field, index) => ({
    id: String(field.id || crypto.randomUUID()),
    type: field.type || "short_text",
    label: String(field.label || "Untitled Question"),
    required: Boolean(field.required),
    placeholder: field.placeholder || "",
    options: Array.isArray(field.options) ? field.options : [],
    sortOrder:
      field.sortOrder !== undefined && field.sortOrder !== null
        ? Number(field.sortOrder)
        : index,
  }));
}

function isValidStatus(status: string) {
  return ["draft", "receiving", "closed"].includes(status);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const authSupabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userErr,
    } = await authSupabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: form, error } = await supabase
      .from("alley_forms")
      .select(`
        id,
        organizer_id,
        title,
        description,
        slug,
        status,
        event_date_start,
        event_date_end,
        event_address,
        cover_image_url,
        application_limit,
        fields,
        published_at,
        created_at,
        updated_at,
        start_date,
        end_date,
        location,
        is_open
      `)
      .eq("id", formId)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.organizer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      form: {
        ...form,
        event_date_start: form.event_date_start || form.start_date || null,
        event_date_end: form.event_date_end || form.end_date || null,
        event_address: form.event_address || form.location || "",
        fields: form.fields || [],
        public_url: form.slug ? `/apply/${form.slug}` : null,
      },
    });
  } catch (err: any) {
    console.error("GET /api/forms/[formId] failed:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const authSupabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userErr,
    } = await authSupabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: existingForm, error: existingErr } = await supabase
      .from("alley_forms")
      .select("id, organizer_id")
      .eq("id", formId)
      .single();

    if (existingErr || !existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (existingForm.organizer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, any> = {};

    if ("title" in body) {
      const title = body.title?.trim();

      if (!title) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }

      updates.title = title;
    }

    if ("description" in body) {
      updates.description = body.description?.trim() || null;
    }

    if ("event_date_start" in body || "startDate" in body || "start_date" in body) {
      const startDate = body.event_date_start ?? body.startDate ?? body.start_date;
      updates.event_date_start = startDate || null;

      // Keeps old code compatible.
      updates.start_date = startDate || null;
    }

    if ("event_date_end" in body || "endDate" in body || "end_date" in body) {
      const endDate = body.event_date_end ?? body.endDate ?? body.end_date;
      updates.event_date_end = endDate || null;

      // Keeps old code compatible.
      updates.end_date = endDate || null;
    }

    if ("event_address" in body || "location" in body || "eventAddress" in body) {
      const address = body.event_address ?? body.location ?? body.eventAddress;
      updates.event_address = address?.trim?.() || null;

      // Keeps old code compatible.
      updates.location = address?.trim?.() || null;
    }

    if ("cover_image_url" in body) {
      updates.cover_image_url = body.cover_image_url || null;
    }

    if ("application_limit" in body) {
      updates.application_limit =
        body.application_limit === "" ||
        body.application_limit === null ||
        body.application_limit === undefined
          ? null
          : Number(body.application_limit);
    }

    if ("fields" in body) {
      if (!Array.isArray(body.fields)) {
        return NextResponse.json(
          { error: "fields must be an array" },
          { status: 400 }
        );
      }

      updates.fields = normalizeFields(body.fields);
    }

    if ("status" in body) {
      if (!isValidStatus(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      updates.status = body.status;

      // Keeps old code compatible.
      updates.is_open = body.status === "receiving";
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedForm, error: updateErr } = await supabase
      .from("alley_forms")
      .update(updates)
      .eq("id", formId)
      .select(`
        id,
        organizer_id,
        title,
        description,
        slug,
        status,
        event_date_start,
        event_date_end,
        event_address,
        cover_image_url,
        application_limit,
        fields,
        published_at,
        created_at,
        updated_at
      `)
      .single();

    if (updateErr) {
      console.error("Update form error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      form: {
        ...updatedForm,
        public_url: updatedForm.slug ? `/apply/${updatedForm.slug}` : null,
      },
    });
  } catch (err: any) {
    console.error("PATCH /api/forms/[formId] failed:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}