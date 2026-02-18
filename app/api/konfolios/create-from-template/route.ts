// app/api/konfolios/create-from-template/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type Template = "square" | "portrait"
type Status = "draft" | "published"

type SocialKey = "website" | "shop" | "instagram" | "x" | "facebook" | "tumblr" | "pixiv" | "bluesky"
type LinksMap = Partial<Record<SocialKey, string>>

type LinkPickerValue = {
  activeKeys: SocialKey[]
  linksByKey: Record<SocialKey, string>
}

type SquareCell = { id: string; src: string; title: string; description: string }
type PortraitCell = { id: string; src: string; title: string; description: string }

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || ""
  if (!authHeader.startsWith("Bearer ")) return null
  return authHeader.slice("Bearer ".length).trim()
}

function supabaseAuthed(token: string) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

function isTemplate(x: any): x is Template {
  return x === "square" || x === "portrait"
}

function isNonEmptyString(v: any): v is string {
  return typeof v === "string" && v.trim().length > 0
}

function normalizeStringArray(v: any): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
}

function normalizeLinksMap(v: any): LinksMap {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {}
  const keys: SocialKey[] = ["website", "shop", "instagram", "x", "facebook", "tumblr", "pixiv", "bluesky"]
  const out: LinksMap = {}
  for (const k of keys) {
    const raw = (v as any)[k]
    if (isNonEmptyString(raw)) out[k] = String(raw).trim()
  }
  return out
}

function linksMapToLinkPickerValue(map: LinksMap): LinkPickerValue {
  const keys: SocialKey[] = ["website", "shop", "instagram", "x", "facebook", "tumblr", "pixiv", "bluesky"]
  const linksByKey: Record<SocialKey, string> = {
    website: "",
    shop: "",
    instagram: "",
    x: "",
    facebook: "",
    tumblr: "",
    pixiv: "",
    bluesky: "",
  }
  const activeKeys: SocialKey[] = []

  for (const k of keys) {
    const v = map[k]
    if (isNonEmptyString(v)) {
      linksByKey[k] = v.trim()
      activeKeys.push(k)
    }
  }

  return { activeKeys, linksByKey }
}

function makeDefaultSquareCells(): SquareCell[] {
  return Array.from({ length: 9 }).map((_, i) => ({
    id: `cell-${i + 1}`,
    src: "",
    title: "Title",
    description: "Short description",
  }))
}

function makeDefaultPortraitCells(): PortraitCell[] {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `cell-${i + 1}`,
    src: "",
    title: "Title",
    description: "Short description",
  }))
}

function makeBaseContent(template: Template) {
  const common = {
    bannerColor: "#FFFFFF",
    backgroundColor: "#F7F7F7",
    bannerSwatches: [] as string[],
    backgroundSwatches: [] as string[],
    profileImageUrl: "",
    businessName: "Business Name",
    displayName: "Name",
    locationText: "City, State",
    email: "myemailaddress@konfolio.com",
    links: linksMapToLinkPickerValue({}),
    merchTags: [] as string[],
    previousVends: [] as string[],
  }

  if (template === "square") {
    return {
      ...common,
      images: makeDefaultSquareCells(),
    }
  }

  return {
    ...common,
    images: makeDefaultPortraitCells(),
  }
}

export async function POST(req: Request) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = supabaseAuthed(token)

  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // allow empty body
  }

  const template: Template = isTemplate(body?.template) ? body.template : "square"

  // Start with template defaults; overlay profile autofill.
  let content: Record<string, any> = makeBaseContent(template)

  // Prefer auth email (profiles columns list you gave doesn't include email)
  if (auth.user.email) content.email = String(auth.user.email).trim()

  // Autofill from profiles (matches your schema)
  try {
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select(
        "first_name, last_name, profile_image_url, preferred_name, business_name, location, merch_tags, prev_vends, links"
      )
      .eq("id", auth.user.id)
      .maybeSingle()

    if (!profErr && profile) {
      const preferred = String((profile as any).preferred_name ?? "").trim()
      const first = String((profile as any).first_name ?? "").trim()
      const last = String((profile as any).last_name ?? "").trim()

      const displayName = (preferred || [first, last].filter(Boolean).join(" ") || first).trim()

      const businessName = String((profile as any).business_name ?? "").trim()
      const locationText = String((profile as any).location ?? "").trim()
      const profileImageUrl = String((profile as any).profile_image_url ?? "").trim()

      const merchTags = normalizeStringArray((profile as any).merch_tags).slice(0, 8)
      const previousVends = normalizeStringArray((profile as any).prev_vends).slice(0, 4)

      const linksMap = normalizeLinksMap((profile as any).links)
      const links = linksMapToLinkPickerValue(linksMap)

      content = {
        ...content,
        ...(displayName ? { displayName } : {}),
        ...(businessName ? { businessName } : {}),
        ...(locationText ? { locationText } : {}),
        ...(profileImageUrl ? { profileImageUrl } : {}),
        merchTags,
        previousVends,
        links, // editor-friendly LinkPickerValue shape
      }
    }
  } catch {
    // ignore autofill failures
  }

  const { data, error } = await supabase
    .from("konfolios")
    .insert({
      user_id: auth.user.id,
      template,
      status: "draft" as Status,
      content,
    })
    .select("id, template, status, updated_at, content")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    content: data.content ?? {},
  })
}
