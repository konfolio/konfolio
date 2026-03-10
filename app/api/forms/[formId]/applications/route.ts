import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: fields, error: fieldsErr } = await supabase
    .from("alley_form_fields")
    .select("id,label,field_key,type,required,options,sort_order")
    .eq("form_id", formId)
    .order("sort_order", { ascending: true });

  if (fieldsErr) {
    return NextResponse.json({ error: fieldsErr.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("alley_applications")
    .select(
      `
      id,
      status,
      created_at,
      answers,
      applicant_id,
      konfolio_id,
      profiles:applicant_id (
        id,
        first_name,
        last_name,
        preferred_name,
        business_name,
        location,
        profile_image_url
      ),
      konfolios:konfolio_id (
        id,
        template,
        status,
        content,
        thumbnail_url
      )
    `
    )
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const applications = (data ?? []).map((row: any) => {
    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      answers: row.answers ?? {},
      applicant: {
  id: row.profiles?.id ?? row.applicant_id ?? null,
  firstName:
    row.profiles?.first_name ??
    row.answers?.first_name ??
    row.answers?.firstName ??
    null,
  lastName:
    row.profiles?.last_name ??
    row.answers?.last_name ??
    row.answers?.lastName ??
    null,
  displayName:
    row.profiles?.preferred_name ||
    row.profiles?.business_name ||
    row.answers?.preferred_name ||
    row.answers?.preferredName ||
    row.answers?.business_name ||
    row.answers?.businessName ||
    row.answers?.first_name ||
    row.answers?.firstName ||
    "Unnamed",
  businessName:
    row.profiles?.business_name ??
    row.answers?.business_name ??
    row.answers?.businessName ??
    null,
  location:
    row.profiles?.location ??
    row.answers?.location ??
    null,
  avatarUrl: row.profiles?.profile_image_url ?? null,
},
      konfolio: {
        id: row.konfolios?.id ?? null,
        template: row.konfolios?.template ?? null,
        thumbnailUrl: row.konfolios?.thumbnail_url ?? null,
      },
    };
  });

  return NextResponse.json({ fields: fields ?? [], applications });
}