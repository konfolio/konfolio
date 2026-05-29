import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ applicantId: string }> }
) {
  const { applicantId } = await params;

  const authSupabase = await createSupabaseServerClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("alley_applications")
    .select(`
      id, status,
      alley_forms:form_id ( id, title )
    `)
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const applications = (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    formTitle: row.alley_forms?.title ?? "Untitled Form",
  }));

  return NextResponse.json({ applications });
}