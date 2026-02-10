// components/my-portfolios/editor/adapters/fromDb.ts
import type { KonfolioDraft, SquareDraft, PortraitDraft, SquareCell, PortraitCell } from "@/components/my-portfolios/editor/editorTypes"
import { emptyLinks } from "@/components/my-portfolios/editor/adapters/fromProfile"

export type DbKonfolio = {
  id: string
  template: "square" | "portrait"
  status?: "draft" | "published"
  updatedAt?: number
  content?: any
}

function ensureSquareCells(cells: any): SquareCell[] {
  const arr: SquareCell[] = Array.isArray(cells) ? cells.slice(0, 9) : []
  while (arr.length < 9) {
    const i = arr.length
    arr.push({
      id: `cell-${i + 1}`,
      src: "",
      title: "Title",
      description: "Short description",
    })
  }
  return arr
}

function ensurePortraitCells(cells: any): PortraitCell[] {
  const arr: PortraitCell[] = Array.isArray(cells) ? cells.slice(0, 8) : []
  while (arr.length < 8) {
    const i = arr.length
    arr.push({
      id: `cell-${i + 1}`,
      src: "",
      title: "Title",
      description: "Short description",
    })
  }
  return arr
}

export function fromDb(db: DbKonfolio): KonfolioDraft {
  const now = Date.now()
  const status = db.status ?? "draft"
  const updatedAt = db.updatedAt ?? now

  // NOTE: content is expected to store draft-like fields, but we defensively default everything.
  const c = (db.content ?? {}) as Record<string, any>

  if (db.template === "square") {
    const draft: SquareDraft = {
      id: db.id,
      template: "square",
      status,
      updatedAt,

      bannerColor: typeof c.bannerColor === "string" ? c.bannerColor : "#FFFFFF",
      backgroundColor: typeof c.backgroundColor === "string" ? c.backgroundColor : "#F7F7F7",
      bannerSwatches: Array.isArray(c.bannerSwatches) ? c.bannerSwatches : [],
      backgroundSwatches: Array.isArray(c.backgroundSwatches) ? c.backgroundSwatches : [],

      profileImageUrl: typeof c.profileImageUrl === "string" ? c.profileImageUrl : "",
      businessName: typeof c.businessName === "string" ? c.businessName : "Business Name",
      displayName: typeof c.displayName === "string" ? c.displayName : "Name",
      locationText: typeof c.locationText === "string" ? c.locationText : "City, State",
      email: typeof c.email === "string" ? c.email : "myemailaddress@konfolio.com",

      links: c.links && typeof c.links === "object" ? c.links : emptyLinks(),
      merchTags: Array.isArray(c.merchTags) ? c.merchTags.slice(0, 8) : [],
      previousVends: Array.isArray(c.previousVends) ? c.previousVends.slice(0, 4) : [],

      images: ensureSquareCells(c.images),
    }

    return draft
  }

  // portrait
  const draft: PortraitDraft = {
    id: db.id,
    template: "portrait",
    status,
    updatedAt,

    bannerColor: typeof c.bannerColor === "string" ? c.bannerColor : "#FFFFFF",
    backgroundColor: typeof c.backgroundColor === "string" ? c.backgroundColor : "#F7F7F7",
    bannerSwatches: Array.isArray(c.bannerSwatches) ? c.bannerSwatches : [],
    backgroundSwatches: Array.isArray(c.backgroundSwatches) ? c.backgroundSwatches : [],

    profileImageUrl: typeof c.profileImageUrl === "string" ? c.profileImageUrl : "",
    businessName: typeof c.businessName === "string" ? c.businessName : "Business Name",
    displayName: typeof c.displayName === "string" ? c.displayName : "Name",
    locationText: typeof c.locationText === "string" ? c.locationText : "City, State",
    email: typeof c.email === "string" ? c.email : "myemailaddress@konfolio.com",

    links: c.links && typeof c.links === "object" ? c.links : emptyLinks(),
    merchTags: Array.isArray(c.merchTags) ? c.merchTags.slice(0, 8) : [],
    previousVends: Array.isArray(c.previousVends) ? c.previousVends.slice(0, 4) : [],

    images: ensurePortraitCells(c.images),
  }

  return draft
}
