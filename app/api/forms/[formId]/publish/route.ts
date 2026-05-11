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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function makeUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  title: string,
  formId: string
) {
  const cleanTitle = slugify(title);
  const baseSlug = cleanTitle || `form-${formId.slice(0, 8)}`;

  let slug = baseSlug;
  let count = 2;

  while (true) {
    const { data, error } = await supabase
      .from("alley_forms")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // No form has this slug, so it is safe.
    if (!data) {
      return slug;
    }

    // This same form already has this slug, so it is safe.
    if (data.id === formId) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count += 1;
  }
}

export async function POST(
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

    const supabase = createAdminClient();

    const { data: form, error: formErr } = await supabase
      .from("alley_forms")
      .select("id, organizer_id, title, slug, status")
      .eq("id", formId)
      .single();

    if (formErr || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.organizer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const finalSlug =
      form.slug || (await makeUniqueSlug(supabase, form.title || "form", form.id));

    const { data: updatedForm, error: updateErr } = await supabase
      .from("alley_forms")
      .update({
        slug: finalSlug,
        status: "receiving",
        published_at: new Date().toISOString(),

        // Keep this for old dashboard/application code that still uses is_open.
        is_open: true,
      })
      .eq("id", formId)
      .select(
        `
        id,
        organizer_id,
        title,
        slug,
        status,
        published_at,
        updated_at
      `
      )
      .single();

    if (updateErr) {
      console.error("Publish form updateErr:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      form: updatedForm,
      publicUrl: `/apply/${finalSlug}`,
    });
  } catch (err: any) {
    console.error("POST /api/forms/[formId]/publish failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to publish form" },
      { status: 500 }
    );
  }
}