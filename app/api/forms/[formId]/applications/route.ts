import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SOCIAL_KEYS } from "@/lib/socialKeys";

function normalizeStringArray(v: any): string[] {
  if (!Array.isArray(v)) return [];

  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
}

function normalizeLinksMap(v: any): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};

  const out: Record<string, string> = {};

  for (const key of SOCIAL_KEYS) {
    const raw = v[key];

    if (typeof raw === "string" && raw.trim()) {
      out[key] = raw.trim();
    }
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
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;
  const authSupabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await authSupabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const supabase = createAdminClient();

  // Verify ownership before reading application or applicant data.
  const { data: formRow, error: formError } = await supabase
    .from("alley_forms")
    .select("fields, organizer_id")
    .eq("id", formId)
    .single();

  if (formError || !formRow) {
    return NextResponse.json(
      { error: "Unable to load form." },
      { status: formError?.code === "PGRST116" ? 404 : 500 },
    );
  }

  if (formRow.organizer_id !== user.id) {
    return NextResponse.json(
      { error: "You do not have access to this form." },
      { status: 403 },
    );
  }

  const fields: any[] = formRow.fields ?? [];

  // Submitted field-ID answers take priority over legacy field-key answers.
  // Explicit blank values must remain blank.
  const getAnswer = (
    answers: Record<string, any>,
    fieldKey: string,
  ) => {
    const field = fields.find(
      (f: any) => f.field_key === fieldKey,
    );

    if (
      field?.id &&
      Object.prototype.hasOwnProperty.call(answers, field.id)
    ) {
      return answers[field.id];
    }

    return answers[fieldKey] ?? null;
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
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  const rows = data ?? [];

  // Preserve the existing portfolio fallback for applications
  // that do not have a linked konfolio.
  const applicantIdsMissingKonfolio = Array.from(
    new Set(
      rows
        .filter(
          (row: any) => !row.konfolio_id && row.applicant_id,
        )
        .map((row: any) => row.applicant_id as string),
    ),
  );

  const fallbackKonfolioByApplicant: Record<string, any> = {};

  if (applicantIdsMissingKonfolio.length > 0) {
    const { data: fallbackKonfolios } = await supabase
      .from("konfolios")
      .select(
        "id, user_id, template, thumbnail_url, portfolio_slug, content, updated_at",
      )
      .in("user_id", applicantIdsMissingKonfolio)
      .order("updated_at", { ascending: false });

    for (const k of fallbackKonfolios ?? []) {
      if (!fallbackKonfolioByApplicant[k.user_id]) {
        fallbackKonfolioByApplicant[k.user_id] = k;
      }
    }
  }

  // Tag usage across this form's applicant pool.
  const tagCounts: Record<string, number> = {};

  for (const row of rows as any[]) {
    const tags = normalizeStringArray(
      row.profiles?.merch_tags,
    );

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

  const fieldIdToKey: Record<string, string> = {};
  const fieldKeyToId: Record<string, string> = {};

  for (const f of fields) {
    if (f.id && f.field_key) {
      fieldIdToKey[f.id] = f.field_key;
      fieldKeyToId[f.field_key] = f.id;
    }
  }

  const fieldsInOrder = [...fields].sort(
    (a: any, b: any) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const applications = (rows as any[]).map((row: any) => {
    const rawAnswers = row.answers ?? {};
    const answersByKey: Record<string, any> = {};

    // Emit answers in question order. Prefer the submitted field-ID
    // value, including empty strings, null, false, and zero.
    for (const f of fieldsInOrder) {
      if (!f.field_key) continue;

      const val =
        f.id !== undefined &&
        Object.prototype.hasOwnProperty.call(rawAnswers, f.id)
          ? rawAnswers[f.id]
          : rawAnswers[f.field_key];

      if (val !== undefined) {
        answersByKey[f.field_key] = val;
      }
    }

    // Preserve remaining recognized legacy answers without replacing
    // values already resolved above.
    for (const [fieldIdOrKey, val] of Object.entries(rawAnswers)) {
      const key = fieldIdToKey[fieldIdOrKey];

      if (key) {
        if (answersByKey[key] === undefined) {
          answersByKey[key] = val;
        }
      } else if (
        fieldKeyToId[fieldIdOrKey] !== undefined &&
        answersByKey[fieldIdOrKey] === undefined
      ) {
        answersByKey[fieldIdOrKey] = val;
      }
    }

    const tags = normalizeStringArray(
      row.profiles?.merch_tags,
    );

    const konfolio =
      row.konfolios ??
      fallbackKonfolioByApplicant[row.applicant_id] ??
      null;

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
          getAnswer(rawAnswers, "first_name") ??
          null,
        lastName:
          row.profiles?.last_name ??
          getAnswer(rawAnswers, "last_name") ??
          null,

        // Use only the submitted preferred name.
        // Do not replace blank answers with profile information.
        displayName: getAnswer(rawAnswers, "preferred_name"),

        businessName:
          row.profiles?.business_name ??
          getAnswer(rawAnswers, "business_name") ??
          null,
        businessSlug: row.profiles?.business_slug ?? null,
        business_slug: row.profiles?.business_slug ?? null,
        location:
          row.profiles?.location ??
          getAnswer(rawAnswers, "location") ??
          null,
        avatarUrl: row.profiles?.profile_image_url ?? null,
        email: getAnswer(rawAnswers, "email") ?? null,
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

  const normalizedFields = fields.map((f: any) => ({
    id: f.id,
    label: f.label,
    field_key: f.field_key,
    type: f.type,
    required: f.required,
    options: f.options ?? [],
    sort_order: f.sortOrder ?? 0,
  }));

  return NextResponse.json({
    fields: normalizedFields,
    applications,
  });
}