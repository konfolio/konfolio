// components/my-portfolios/editor/adapters/fromOnboarding.ts — DEBUG VERSION (adds _debugSource)
import type { SquareDraft, SquareCell } from "@/components/my-portfolios/editor/editorTypes"
import type { MediaKey } from "@/stores/onboardingDraft"
import type { LinkPickerValue, LinkKey } from "@/components/my-portfolios/LinkPicker"
import { emptyLinks } from "@/components/my-portfolios/editor/adapters/fromProfile"

function trimOrEmpty(s?: string | null) {
  return (s ?? "").trim()
}

function makeDefaultSquareCells(): SquareCell[] {
  return Array.from({ length: 9 }).map((_, i) => ({
    id: `cell-${i + 1}`,
    src: "",
    title: "Title",
    description: "Short description",
  }))
}

const ALL_LINK_KEYS: LinkKey[] = ["website", "shop", "instagram", "x", "facebook", "tumblr", "pixiv", "bluesky"]

function isLinkKey(k: string): k is LinkKey {
  return (ALL_LINK_KEYS as string[]).includes(k)
}

function toLinkPickerValue(args: {
  activeLinkKeys?: MediaKey[]
  links?: Partial<Record<MediaKey, string>>
}): LinkPickerValue {
  const base = emptyLinks()

  const activeKeys: LinkKey[] = (args.activeLinkKeys ?? [])
    .filter((k): k is LinkKey => isLinkKey(k))
    .filter((k, i, arr) => arr.indexOf(k) === i)

  const linksByKey = { ...base.linksByKey }
  for (const k of ALL_LINK_KEYS) {
    const raw = args.links?.[k as MediaKey]
    linksByKey[k] = trimOrEmpty(raw)
  }

  return { activeKeys, linksByKey }
}

export function fromOnboardingToSquareDraft(params: {
  id: string
  onboarding: {
    firstName?: string
    lastName?: string
    preferredName?: string
    businessName?: string
    location?: string
    prevVends?: string[]
    merchTags?: string[]
    activeLinkKeys?: MediaKey[]
    links?: Partial<Record<MediaKey, string>>
    profilePreviewUrl?: string | null
    email?: string | null
  }
}): SquareDraft {
  const o = params.onboarding

  const preferred = trimOrEmpty(o.preferredName)
  const full = `${trimOrEmpty(o.firstName)} ${trimOrEmpty(o.lastName)}`.trim()
  const displayName = preferred || full || "Name"

  const draft: SquareDraft = {
    id: params.id,
    template: "square",
    status: "draft",
    updatedAt: Date.now(),

    bannerColor: "#FFFFFF",
    backgroundColor: "#F7F7F7",
    bannerSwatches: [],
    backgroundSwatches: [],

    profileImageUrl: o.profilePreviewUrl ?? "",
    businessName: trimOrEmpty(o.businessName) || "Business Name",
    displayName,
    locationText: trimOrEmpty(o.location) || "City, State",
    email: trimOrEmpty(o.email) || "myemailaddress@konfolio.com",

    links: toLinkPickerValue({ activeLinkKeys: o.activeLinkKeys, links: o.links }),
    merchTags: (o.merchTags ?? []).slice(0, 8),
    previousVends: (o.prevVends ?? []).slice(0, 4),

    images: makeDefaultSquareCells(),
  }

  // debug marker (not part of the type)
  ;(draft as any)._debugSource = "fromOnboardingToSquareDraft"

  return draft
}
