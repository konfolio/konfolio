import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"
import { supabase } from "@/lib/supabase/browser"

type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

function defaultLinks() {
  return {
    activeKeys: [] as SocialKey[],
    linksByKey: {
      website: "",
      shop: "",
      instagram: "",
      x: "",
      facebook: "",
      tumblr: "",
      pixiv: "",
      bluesky: "",
    } as Record<SocialKey, string>,
  }
}

function draftFromKonfolioResponse(data: any): KonfolioDraft | null {
  const id = String(data?.id ?? "").trim()
  const template = data?.template

  if (!id) return null
  if (template !== "square" && template !== "portrait") return null

  const content =
    data?.content && typeof data.content === "object" ? data.content : {}

  const links =
    content.links &&
    typeof content.links === "object" &&
    Array.isArray(content.links.activeKeys)
      ? content.links
      : defaultLinks()

  const merchTags = Array.isArray(content.merchTags) ? content.merchTags : []
  const previousVends = Array.isArray(content.previousVends)
    ? content.previousVends
    : []
  const images = Array.isArray(content.images) ? content.images : []

  return {
    id,
    template,
    status: data?.status === "published" ? "published" : "draft",
    updatedAt: Date.now(),

    bannerColor: String(content.bannerColor ?? "#FFFFFF"),
    backgroundColor: String(content.backgroundColor ?? "#F7F7F7"),
    bannerSwatches: Array.isArray(content.bannerSwatches)
      ? content.bannerSwatches
      : [],
    backgroundSwatches: Array.isArray(content.backgroundSwatches)
      ? content.backgroundSwatches
      : [],

    profileImageUrl: String(content.profileImageUrl ?? ""),
    businessName: String(content.businessName ?? "Business Name"),
    displayName: String(content.displayName ?? "Name"),
    locationText: String(content.locationText ?? "City, State"),
    email: String(content.email ?? "myemailaddress@konfolio.com"),

    links,
    merchTags,
    previousVends,
    images,
  } as KonfolioDraft
}

export async function duplicateKonfolio(konfolioId: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error("No active session")
  }

  const res = await fetch(`/api/konfolios/${konfolioId}/duplicate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json?.error || "Failed to duplicate konfolio")
  }

  const konfolio = json?.konfolio
  const draft = draftFromKonfolioResponse(konfolio)

  if (!draft) {
    throw new Error("Duplicate succeeded but returned invalid draft data")
  }

  return { konfolio, draft }
}