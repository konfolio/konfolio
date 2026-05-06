import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

type Template = "square" | "portrait"
type Status = "draft" | "published"

function isTemplate(x: any): x is Template {
  return x === "square" || x === "portrait"
}
function isStatus(x: any): x is Status {
  return x === "draft" || x === "published"
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || ""
  if (!authHeader.startsWith("Bearer ")) return null
  return authHeader.slice("Bearer ".length).trim()
}

function supabaseAuthed(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )
}

function slugify(input: string) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 })

  const supabase = supabaseAuthed(token)

  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("konfolios")
    .select(
      "id, template, status, updated_at, content, explore_enabled, portfolio_name, portfolio_slug"
    )
    .eq("id", id)
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json(
      { error: status === 404 ? "Not found" : error.message },
      { status }
    )
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    exploreEnabled: (data as any).explore_enabled,
    portfolioName: (data as any).portfolio_name,
    portfolioSlug: (data as any).portfolio_slug,
    content: data.content,
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 })

  const supabase = supabaseAuthed(token)

  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const patch: Record<string, any> = {}

  if (body.template !== undefined) {
    if (!isTemplate(body.template)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 })
    }
    patch.template = body.template
  }

  if (body.status !== undefined) {
    if (!isStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    patch.status = body.status
  }

  if (body.content !== undefined) {
    patch.content = body.content
  }

  if (body.explore_enabled !== undefined) {
    if (typeof body.explore_enabled !== "boolean") {
      return NextResponse.json(
        { error: "explore_enabled must be a boolean" },
        { status: 400 }
      )
    }
    patch.explore_enabled = body.explore_enabled
  }

  if (body.portfolio_name !== undefined) {
    if (typeof body.portfolio_name !== "string") {
      return NextResponse.json(
        { error: "portfolio_name must be a string" },
        { status: 400 }
      )
    }

    const trimmed = body.portfolio_name.trim()
    if (!trimmed) {
      return NextResponse.json(
        { error: "Portfolio name cannot be empty" },
        { status: 400 }
      )
    }

    const { data: duplicateName, error: duplicateNameErr } = await supabase
      .from("konfolios")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("portfolio_name", trimmed)
      .neq("id", id)
      .limit(1)
      .maybeSingle()

    if (duplicateNameErr) {
      return NextResponse.json({ error: duplicateNameErr.message }, { status: 500 })
    }

    if (duplicateName) {
      return NextResponse.json(
        { error: "That Konfolio name is already in use" },
        { status: 409 }
      )
    }

    patch.portfolio_name = trimmed
  }

  if (body.portfolio_slug !== undefined) {
    if (typeof body.portfolio_slug !== "string") {
      return NextResponse.json(
        { error: "portfolio_slug must be a string" },
        { status: 400 }
      )
    }

    const normalized = slugify(body.portfolio_slug)
    if (!normalized) {
      return NextResponse.json(
        { error: "Portfolio slug cannot be empty" },
        { status: 400 }
      )
    }

    const { data: duplicate, error: duplicateErr } = await supabase
      .from("konfolios")
      .select("id")
      .eq("portfolio_slug", normalized)
      .neq("id", id)
      .limit(1)
      .maybeSingle()

    if (duplicateErr) {
      return NextResponse.json({ error: duplicateErr.message }, { status: 500 })
    }

    if (duplicate) {
      return NextResponse.json(
        { error: "That URL slug is already in use" },
        { status: 409 }
      )
    }

    patch.portfolio_slug = normalized
  }

  if (patch.status === "draft") {
    patch.explore_enabled = false
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("konfolios")
    .update(patch)
    .eq("id", id)
    .select(
      "id, template, status, updated_at, content, explore_enabled, portfolio_name, portfolio_slug"
    )
    .single()

  if (error) {
    if (error.code === "23505") {
      const msg = error.message?.toLowerCase() ?? ""

      if (msg.includes("portfolio_slug")) {
        return NextResponse.json(
          { error: "That URL slug is already in use" },
          { status: 409 }
        )
      }

      if (msg.includes("portfolio_name")) {
        return NextResponse.json(
          { error: "That Konfolio name is already in use" },
          { status: 409 }
        )
      }
    }

    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json(
      { error: status === 404 ? "Not found" : error.message },
      { status }
    )
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    exploreEnabled: (data as any).explore_enabled,
    portfolioName: (data as any).portfolio_name,
    portfolioSlug: (data as any).portfolio_slug,
    content: data.content,
  })
}

async function deleteStoragePrefix(
  supabaseAdmin: SupabaseClient,
  bucket: string,
  prefix: string
) {
  const toDelete: string[] = []

  async function walk(path: string) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(path, {
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) throw error
    if (!data) return

    for (const item of data) {
      const full = path ? `${path}/${item.name}` : item.name

      if ((item as any).id) {
        toDelete.push(full)
      } else {
        await walk(full)
      }
    }
  }

  await walk(prefix)

  if (toDelete.length === 0) return { deleted: 0 }

  const { error: removeErr } = await supabaseAdmin.storage.from(bucket).remove(toDelete)
  if (removeErr) throw removeErr

  return { deleted: toDelete.length }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token)
  const user = userRes?.user
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: k, error: kErr } = await supabaseAdmin
    .from("konfolios")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle()

  if (kErr) return NextResponse.json({ error: kErr.message }, { status: 500 })
  if (!k || k.user_id !== user.id) {
    return NextResponse.json({ error: "Konfolio not found" }, { status: 404 })
  }

  const prefix = `${user.id}/${id}`
  let deletedStorageObjects = 0

  try {
    const res = await deleteStoragePrefix(supabaseAdmin, "konfolio-images", prefix)
    deletedStorageObjects = res.deleted
  } catch (e: any) {
    console.warn("Storage cleanup failed:", e?.message ?? e)
  }

  const { data, error } = await supabaseAdmin
    .from("konfolios")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    deletedCount: data?.length ?? 0,
    deletedIds: data?.map((r) => r.id) ?? [],
    deletedStorageObjects,
  })
}