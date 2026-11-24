import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const formId = searchParams.get("formId");

  const authSupabase = await createSupabaseServerClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user || !formId) return NextResponse.json({ submitted: false });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("alley_applications")
    .select("id")
    .eq("form_id", formId)
    .eq("applicant_id", user.id)
    .maybeSingle();

  return NextResponse.json({ submitted: !!data });
}