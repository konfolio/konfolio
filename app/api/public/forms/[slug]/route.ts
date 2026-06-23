import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey);
}

type FormField = {
  id: string;
  label?: string;
  field_key?: string | null;
  fieldKey?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  sortOrder?: number;
  sort_order?: number;
};

function cleanValue(value: any) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  if (Array.isArray(value) && value.length === 0) return undefined;

  return value;
}

function getLinkValue(profile: any, key: string) {
  const links = profile?.links;

  if (!links) return undefined;

  if (links.linksByKey?.[key]?.url) {
    return links.linksByKey[key].url;
  }

  if (links.linksByKey?.[key]) {
    return links.linksByKey[key];
  }

  if (links[key]?.url) {
    return links[key].url;
  }

  if (links[key]) {
    return links[key];
  }

  return undefined;
}

function getRawAutofillValue(
  fieldKey: string | null | undefined,
  profile: any,
  userEmail?: string | null
) {
  if (!fieldKey) return undefined;

  const map: Record<string, any> = {
    first_name: profile.first_name,
    last_name: profile.last_name,
    preferred_name: profile.preferred_name,
    display_name: profile.display_name,
    business_name: profile.business_name,
    email: userEmail,

    location: profile.location,
    sales_permit: profile.sales_permit,
    will_apply: profile.will_apply,
    collabs: profile.collabs,
    first_vend: profile.first_vend,

    previous_vending: profile.prev_vends,
    prev_vends: profile.prev_vends,

    vend_experience_1: profile.prev_vends?.[0],
    vend_experience_2: profile.prev_vends?.[1],
    vend_experience_3: profile.prev_vends?.[2],
    vend_experience_4: profile.prev_vends?.[3],

    instagram: getLinkValue(profile, "instagram"),
    tiktok: getLinkValue(profile, "tiktok"),
    website: getLinkValue(profile, "website"),
    portfolio: getLinkValue(profile, "portfolio"),
  };

  return cleanValue(map[fieldKey]);
}

function formatAutofillValueForField(value: any, field: FormField) {
  if (value === undefined) return undefined;

  const fieldType = field.type || "short_text";

  if (typeof value === "boolean") {
    if (fieldType === "multiple_choice" && Array.isArray(field.options)) {
      const yesOption = field.options.find(
        (option) => option.toLowerCase() === "yes"
      );

      const noOption = field.options.find(
        (option) => option.toLowerCase() === "no"
      );

      if (value && yesOption) return yesOption;
      if (!value && noOption) return noOption;
    }

    return value;
  }

  if (Array.isArray(value)) {
    if (fieldType === "checkbox") {
      return value;
    }

    return value.join(", ");
  }

  return value;
}

function buildAutofill(
  fields: FormField[],
  profile: any,
  userEmail?: string | null
) {
  const autofill: Record<string, any> = {};

  for (const field of fields) {
    const autofillKey = field.field_key ?? field.fieldKey ?? field.id;

    const rawValue = getRawAutofillValue(autofillKey, profile, userEmail);
    const formattedValue = formatAutofillValueForField(rawValue, field);

    if (formattedValue !== undefined) {
      autofill[field.id] = formattedValue;
    }
  }

  return autofill;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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
        is_recurring,
        recurrence_text
      `)
      .eq("slug", slug)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status === "draft") {
      return NextResponse.json(
        { error: "This form has not been published yet" },
        { status: 404 }
      );
    }

    const fields: FormField[] = Array.isArray(form.fields) ? form.fields : [];

    const authSupabase = await createSupabaseServerClient();

    const authResult = await authSupabase.auth.getUser();
    let user = authResult.data.user;

    // Fallback for frontend/client-side Supabase sessions.
    // If the server cannot read cookies, allow the frontend to pass:
    // Authorization: Bearer <access_token>
    if (!user) {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null;

      if (token) {
        const { data: tokenUserData, error: tokenUserError } =
          await supabase.auth.getUser(token);

        if (tokenUserError) {
          console.error("PUBLIC FORM TOKEN USER ERROR:", tokenUserError);
        }

        user = tokenUserData.user ?? null;
      }
    }

    let autofill: Record<string, any> = {};

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          preferred_name,
          display_name,
          business_name,
          location,
          sales_permit,
          will_apply,
          collabs,
          first_vend,
          prev_vends,
          links,
          profile_image_url
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to load applicant profile:", profileError);
      }

      if (profile) {
        autofill = buildAutofill(fields, profile, user.email);
      }
    }

    const eventDateStart = form.event_date_start || form.start_date || null;
    const eventDateEnd = form.event_date_end || form.end_date || null;
    const eventAddress = form.event_address || form.location || null;
    const isRecurring = Boolean(form.is_recurring);
    const recurrenceText = form.recurrence_text || null;

    return NextResponse.json({
      form: {
        ...form,
        event_date_start: eventDateStart,
        event_date_end: eventDateEnd,
        event_address: eventAddress,
        is_recurring: isRecurring,
        recurrence_text: recurrenceText,

        // CamelCase aliases for frontend compatibility.
        isRecurring,
        recurrenceText: recurrenceText || "",

        fields,
      },
      autofill,
    });
  } catch (err: any) {
    console.error("GET /api/public/forms/[slug] failed:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to load form" },
      { status: 500 }
    );
  }
}