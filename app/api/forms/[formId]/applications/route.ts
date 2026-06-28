import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
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

  // Fetch form fields once
  const { data: formRow } = await supabase
    .from("alley_forms")
    .select("fields")
    .eq("id", formId)
    .single();

  const fields: any[] = formRow?.fields ?? [];

  // Helper to get answer by field_key from raw (field-id-keyed) answers
  const getAnswer = (answers: Record<string, any>, fieldKey: string) => {
    if (answers[fieldKey] !== undefined) return answers[fieldKey];
    const field = fields.find((f: any) => f.field_key === fieldKey);
    if (field && answers[field.id] !== undefined) return answers[field.id];
    return null;
  };

  const { data, error } = await supabase
    .from("alley_applications")
    .select(`
      id, status, created_at, answers, applicant_id, konfolio_id,
      profiles:applicant_id (
        id, first_name, last_name, preferred_name,
        business_name, business_slug, location, profile_image_url
      ),
      konfolios:konfolio_id (
        id, template, thumbnail_url, portfolio_name, portfolio_slug
      )
    `)
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Build a map of field_id -> field_key for answer lookup
  const fieldIdToKey: Record<string, string> = {};
  const fieldKeyToId: Record<string, string> = {};

  for (const f of fields) {
    if (f.id && f.field_key) {
      fieldIdToKey[f.id] = f.field_key;
      fieldKeyToId[f.field_key] = f.id;
    }
  }

  const applications = (data ?? []).map((row: any) => {
    // answers are keyed by field id — normalize to field_key too
    const answersByKey: Record<string, any> = {};

    for (const [fieldId, val] of Object.entries(row.answers ?? {})) {
      const key = fieldIdToKey[fieldId];
      if (key) answersByKey[key] = val;
    }

    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      answers: answersByKey,
      applicant: {
        id: row.profiles?.id ?? row.applicant_id ?? null,
        firstName:
          row.profiles?.first_name ??
          getAnswer(row.answers ?? {}, "first_name") ??
          null,
        lastName:
          row.profiles?.last_name ??
          getAnswer(row.answers ?? {}, "last_name") ??
          null,
        displayName:
          row.profiles?.preferred_name ||
          row.profiles?.business_name ||
          getAnswer(row.answers ?? {}, "preferred_name") ||
          getAnswer(row.answers ?? {}, "first_name") ||
          "Unnamed",
        businessName:
          row.profiles?.business_name ??
          getAnswer(row.answers ?? {}, "business_name") ??
          null,
        businessSlug: row.profiles?.business_slug ?? null,
        business_slug: row.profiles?.business_slug ?? null,
        location:
          row.profiles?.location ??
          getAnswer(row.answers ?? {}, "location") ??
          null,
        avatarUrl: row.profiles?.profile_image_url ?? null,
        email: getAnswer(row.answers ?? {}, "email") ?? null,
      },
      konfolio: {
        id: row.konfolios?.id ?? null,
        template: row.konfolios?.template ?? null,
        thumbnailUrl: row.konfolios?.thumbnail_url ?? null,
        thumbnail_url: row.konfolios?.thumbnail_url ?? null,
        portfolioName: row.konfolios?.portfolio_name ?? null,
        portfolio_name: row.konfolios?.portfolio_name ?? null,
        portfolioSlug: row.konfolios?.portfolio_slug ?? null,
        portfolio_slug: row.konfolios?.portfolio_slug ?? null,
      },
    };
  });

  // Return fields in the format the table expects
  const normalizedFields = fields.map((f: any) => ({
    id: f.id,
    label: f.label,
    field_key: f.field_key,
    type: f.type,
    required: f.required,
    options: f.options ?? [],
    sort_order: f.sortOrder ?? 0,
  }));

  return NextResponse.json({ fields: normalizedFields, applications });
}
