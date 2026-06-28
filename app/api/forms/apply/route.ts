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

    const { formId, responses, konfolioId: providedKonfolioId } = await req.json();
    if (!formId) return NextResponse.json({ error: "Missing formId" }, { status: 400 });

    const authSupabase = await createSupabaseServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to apply." }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: form, error: formErr } = await supabase
    .from("alley_forms")
    .select("organizer_id, application_limit, is_open, status")
    .eq("id", formId)
    .single();

    if (formErr || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status === "closed" || form.is_open === false) {
      return NextResponse.json(
        { error: "This form is no longer accepting applications." },
        { status: 403 },
      );
    }

    const { count } = await supabase
      .from("alley_applications")
      .select("*", { count: "exact", head: true })
      .eq("form_id", formId);

    if (form.application_limit && count != null && count >= form.application_limit) {
      await supabase
        .from("alley_forms")
        .update({ is_open: false, status: "closed" })
        .eq("id", formId);
    }

    // Check duplicate submission
    const { data: existing } = await supabase
      .from("alley_applications")
      .select("id")
      .eq("form_id", formId)
      .eq("applicant_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "already_submitted" }, { status: 409 });
    }

    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Use the konfolio the user selected during autofill, or fall back to most recent
    let konfolio: { id: string } | null = null;
    if (providedKonfolioId) {
      const { data } = await supabase
        .from("konfolios")
        .select("id")
        .eq("id", providedKonfolioId)
        .eq("user_id", user.id)
        .maybeSingle();
      konfolio = data;
    }
    if (!konfolio) {
      const { data } = await supabase
        .from("konfolios")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      konfolio = data;
    }

    // Artists must have a konfolio
    if (role === "artist" && !konfolio) {
      return NextResponse.json(
        { error: "You need a published konfolio to apply." },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("alley_applications")
      .insert({
        form_id: formId,
        organizer_id: form.organizer_id,
        applicant_id: user.id,
        konfolio_id: konfolio?.id ?? null,
        answers: responses,
        status: "pending",
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message || "Server error" }, { status: 500 });
  }
}