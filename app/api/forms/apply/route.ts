import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const { formId, responses } = await req.json();
    if (!formId) return NextResponse.json({ error: "Missing formId" }, { status: 400 });

    const supabase = createAdminClient();

    const { data: form, error: formErr } = await supabase
      .from("alley_forms")
      .select("organizer_id")
      .eq("id", formId)
      .single();

    if (formErr || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const authSupabase = await createSupabaseServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    let konfolioId: string | null = null;

    if (user) {
      const { data: konfolio } = await supabase
        .from("konfolios")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      konfolioId = konfolio?.id ?? null;
    }

    const { error } = await supabase
      .from("alley_applications")
      .insert({
        form_id: formId,
        organizer_id: form.organizer_id,
        applicant_id: user?.id ?? null,
        konfolio_id: konfolioId,
        answers: responses,
        status: "pending",
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}