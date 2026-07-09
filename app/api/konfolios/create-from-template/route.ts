import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type Template = "square" | "portrait"
type Status = "draft" | "published"

type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

type LinksMap = Partial<Record<SocialKey, string>>

type LinkPickerValue = {
  activeKeys: SocialKey[]
  linksByKey: Record<SocialKey, string>
}

type SquareCell = {
  id: string
  src: string
  title: string
  description: string
}

type PortraitCell = {
  id: string
  src: string
  title: string
  description: string
}

const MAX_PUBLISHED_KONFOLIOS = 3
const UNLIMITED_KONFOLIO_EMAIL = "konfolios@gmail.com"

function hasUnlimitedKonfolios(email?: string | null) {
  return email?.trim().toLowerCase() === UNLIMITED_KONFOLIO_EMAIL
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

function isTemplate(x: any): x is Template {
  return x === "square" || x === "portrait"
}

function isNonEmptyString(v: any): v is string {
  return typeof v === "string" && v.trim().length > 0
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeStringArray(v: any): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
}

function normalizeLinksMap(v: any): LinksMap {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {}

  const keys: SocialKey[] = [
    "website",
    "shop",
    "instagram",
    "x",
    "facebook",
    "tumblr",
    "pixiv",
    "bluesky",
  ]

  const out: LinksMap = {}

  for (const k of keys) {
    const raw = (v as any)[k]
    if (isNonEmptyString(raw)) out[k] = String(raw).trim()
  }

  return out
}

function linksMapToLinkPickerValue(map: LinksMap): LinkPickerValue {
  const keys: SocialKey[] = [
    "website",
    "shop",
    "instagram",
    "x",
    "facebook",
    "tumblr",
    "pixiv",
    "bluesky",
  ]

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

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = supabaseAuthed(token)

  const { data: auth, error: authErr } = await supabase.auth.getUser()

  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any = {}

  try {
    body = await req.json()
  } catch {
    // allow empty body
  }

  const template: Template = isTemplate(body?.template)
    ? body.template
    : "square"

  let content: Record<string, any> = makeBaseContent(template)

  if (auth.user.email) {
    content.email = String(auth.user.email).trim()
  }

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

      const displayName = (
        preferred ||
        [first, last].filter(Boolean).join(" ") ||
        first
      ).trim()

      const businessName = String((profile as any).business_name ?? "").trim()
      const locationText = String((profile as any).location ?? "").trim()
      const profileImageUrl = String(
        (profile as any).profile_image_url ?? ""
      ).trim()

      const merchTags = normalizeStringArray((profile as any).merch_tags).slice(
        0,
        8
      )

      const previousVends = normalizeStringArray(
        (profile as any).prev_vends
      ).slice(0, 4)

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
        links,
      }
    }
  } catch {
    // ignore profile hydration errors
  }

  const portfolioName: string = isNonEmptyString(body?.portfolioName)
    ? body.portfolioName.trim()
    : "Untitled Portfolio"

  const portfolioSlug: string =
    slugify(portfolioName) || `portfolio-${Date.now()}`

  const { count, error: countError } = await supabase
    .from("konfolios")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .eq("status", "published")

  if (countError) {
    return NextResponse.json(
      { error: "Failed to check konfolio count." },
      { status: 500 }
    )
  }

  const limitReached =
    !hasUnlimitedKonfolios(auth.user.email) &&
    (count ?? 0) >= MAX_PUBLISHED_KONFOLIOS

  if (limitReached) {
    return NextResponse.json(
      { error: "You have reached the limit of 3 published konfolios." },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from("konfolios")
    .insert({
      user_id: auth.user.id,
      template,
      status: "draft" as Status,
      portfolio_name: portfolioName,
      portfolio_slug: portfolioSlug,
      content,
      explore_enabled: false,
    })
    .select(
      "id, template, status, updated_at, content, portfolio_name, portfolio_slug, explore_enabled"
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    portfolioName: data.portfolio_name,
    portfolioSlug: data.portfolio_slug,
    exploreEnabled: data.explore_enabled,
    content: data.content ?? {},
  })
}