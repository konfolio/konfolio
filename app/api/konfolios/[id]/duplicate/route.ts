import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const authHeader = req.headers.get("authorization")
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: original, error: originalError } = await supabase
      .from("konfolios")
      .select("*")
      .eq("id", id)
      .single()

    if (originalError || !original) {
      return NextResponse.json({ error: "Konfolio not found" }, { status: 404 })
    }

    if (original.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const duplicatedName = makeCopyName(original.portfolio_name)
    const duplicatedSlug = await makeUniqueSlug(
      supabase,
      user.id,
      slugify(duplicatedName)
    )

    const copiedContent =
      typeof structuredClone === "function"
        ? structuredClone(original.content ?? {})
        : JSON.parse(JSON.stringify(original.content ?? {}))

    const { data: duplicated, error: insertError } = await supabase
      .from("konfolios")
      .insert({
        user_id: user.id,
        template: original.template,
        status: "draft",
        content: copiedContent,
        portfolio_name: duplicatedName,
        portfolio_slug: duplicatedSlug,
        thumbnail_url: null,
        published_at: null,
      })
      .select()
      .single()

    if (insertError || !duplicated) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to duplicate konfolio" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, konfolio: duplicated }, { status: 200 })
  } catch (error) {
    console.error("Duplicate konfolio error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function makeCopyName(name?: string | null) {
  const trimmed = (name ?? "").trim()

  if (!trimmed) return "Untitled Copy"

  const numberedMatch = trimmed.match(/^(.*)\sCopy\s(\d+)$/i)
  if (numberedMatch) {
    const base = numberedMatch[1].trim()
    const num = Number(numberedMatch[2])
    return `${base} Copy ${num + 1}`
  }

  if (/ copy$/i.test(trimmed)) {
    return `${trimmed} 2`
  }

  return `${trimmed} Copy`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function makeUniqueSlug(
  supabase: any,
  userId: string,
  baseSlug: string
) {
  const safeBase = baseSlug || "untitled-copy"
  let candidate = safeBase
  let counter = 2

  while (true) {
    const { data, error } = await supabase
      .from("konfolios")
      .select("id")
      .eq("user_id", userId)
      .eq("portfolio_slug", candidate)
      .maybeSingle()

    if (error) throw error
    if (!data) return candidate

    candidate = `${safeBase}-${counter}`
    counter += 1
  }
}