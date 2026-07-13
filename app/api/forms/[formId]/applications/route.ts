import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SOCIAL_KEYS } from "@/lib/socialKeys";

function normalizeStringArray(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
}

function normalizeLinksMap(v: any): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) {
    const raw = (v as any)[key];
    if (typeof raw === "string" && raw.trim()) out[key] = raw.trim();
  }
  return out;
}

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
      id, status, created_at, answers, applicant_id, konfolio_id, organizer_notes,
      profiles:applicant_id (
        id, first_name, last_name, preferred_name,
        business_name, business_slug, location, profile_image_url,
        links, merch_tags
      ),
      konfolios:konfolio_id (
        id, template, thumbnail_url, portfolio_slug, content
      )
    `)
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = data ?? [];

  // Applications submitted before the applicant had a konfolio (or where
  // linking failed) have a null konfolio_id forever after — fall back to
  // their most recently updated konfolio so reviewers still see it.
  const applicantIdsMissingKonfolio = Array.from(
    new Set(
      rows
        .filter((row: any) => !row.konfolio_id && row.applicant_id)
        .map((row: any) => row.applicant_id as string),
    ),
  );

  const fallbackKonfolioByApplicant: Record<string, any> = {};
  if (applicantIdsMissingKonfolio.length > 0) {
    const { data: fallbackKonfolios } = await supabase
      .from("konfolios")
      .select("id, user_id, template, thumbnail_url, portfolio_slug, content, updated_at")
      .in("user_id", applicantIdsMissingKonfolio)
      .order("updated_at", { ascending: false });

    for (const k of fallbackKonfolios ?? []) {
      if (!fallbackKonfolioByApplicant[k.user_id]) {
        fallbackKonfolioByApplicant[k.user_id] = k;
      }
    }
  }

  // Tag usage across this form's applicant pool, keyed by tag -> % of applications
  const tagCounts: Record<string, number> = {};
  for (const row of rows as any[]) {
    const tags = normalizeStringArray(row.profiles?.merch_tags);
    for (const tag of new Set(tags)) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const totalApplications = rows.length;
  const tagPercentages: Record<string, number> = {};
  for (const [tag, count] of Object.entries(tagCounts)) {
    tagPercentages[tag] = totalApplications
      ? Math.round((count / totalApplications) * 1000) / 10
      : 0;
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

  const applications = (rows as any[]).map((row: any) => {
    // answers are keyed by field id — normalize to field_key too.
    // Also handle legacy submissions where answers were keyed by field_key directly.
    const answersByKey: Record<string, any> = {};

    for (const [fieldIdOrKey, val] of Object.entries(row.answers ?? {})) {
      const key = fieldIdToKey[fieldIdOrKey];
      if (key) {
        answersByKey[key] = val;
      } else if (fieldKeyToId[fieldIdOrKey] !== undefined) {
        answersByKey[fieldIdOrKey] = val;
      }
    }

    const tags = normalizeStringArray(row.profiles?.merch_tags);
    const konfolio =
      row.konfolios ?? fallbackKonfolioByApplicant[row.applicant_id] ?? null;

    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      answers: answersByKey,
      organizerNotes: row.organizer_notes ?? "",
      tagUsage: tags.map((tag) => ({
        tag,
        percentage: tagPercentages[tag] ?? 0,
      })),
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
          getAnswer(row.answers ?? {}, "preferred_name") ||
          null,
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
        links: normalizeLinksMap(row.profiles?.links),
        tags,
      },
      konfolio: {
        id: konfolio?.id ?? null,
        template: konfolio?.template ?? null,
        thumbnailUrl: konfolio?.thumbnail_url ?? null,
        thumbnail_url: konfolio?.thumbnail_url ?? null,
        portfolioSlug: konfolio?.portfolio_slug ?? null,
        portfolio_slug: konfolio?.portfolio_slug ?? null,
        content: konfolio?.content ?? null,
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
