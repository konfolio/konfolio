// app/api/analytics/home-metrics/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const page = "home";

  // total viewings
  const totalRes = await supabase
    .from("site_views")
    .select("id", { count: "exact", head: true })
    .eq("page", page);

  // unique viewers -> fetch viewer_id and count distinct 
  // Supabase doesn't do COUNT(DISTINCT ...) simpley
  
  const uniqueRes = await supabase
    .from("site_views")
    .select("viewer_id")
    .eq("page", page);

  if (totalRes.error) return NextResponse.json({ error: totalRes.error.message }, { status: 500 });
  if (uniqueRes.error) return NextResponse.json({ error: uniqueRes.error.message }, { status: 500 });

  const uniqueViewers = new Set(uniqueRes.data.map(r => r.viewer_id)).size;

  return NextResponse.json({
    totalViewings: totalRes.count ?? 0,
    uniqueViewers,
  });
}