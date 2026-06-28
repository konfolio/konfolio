import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET(req: Request) {
  const authSupabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await authSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const name = searchParams.get("name") || ""
  const slug = slugify(name)

  if (!slug) {
    return NextResponse.json({
      available: false,
      slug,
      error: "Business name must include letters or numbers",
    })
  }

  const supabase = createAdminClient()
  const { data: existing, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("business_slug", slug)
    .neq("id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    available: !existing,
    slug,
  })
}