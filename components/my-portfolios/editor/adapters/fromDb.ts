// components/my-portfolios/editor/adapters/fromDb.ts
import type { KonfolioDraft, SquareDraft } from "@/components/my-portfolios/editor/editorTypes"
import { emptyLinks } from "@/components/my-portfolios/editor/adapters/fromProfile"

export type DbKonfolio = {
  id: string
  template: "square" | "portrait"
  status?: "draft" | "published"
  updatedAt?: number
  content?: any
}

export function fromDb(db: DbKonfolio): KonfolioDraft {
  const now = Date.now()
  const status = db.status ?? "draft"
  const updatedAt = db.updatedAt ?? now

  if (db.template === "square") {
    const c = (db.content ?? {}) as Partial<SquareDraft>

    const draft: SquareDraft = {
      id: db.id,
      template: "square",
      status,
      updatedAt,

      bannerColor: c.bannerColor ?? "#FFFFFF",
      backgroundColor: c.backgroundColor ?? "#F7F7F7",
      bannerSwatches: Array.isArray(c.bannerSwatches) ? c.bannerSwatches : [],
      backgroundSwatches: Array.isArray(c.backgroundSwatches) ? c.backgroundSwatches : [],

      profileImageUrl: c.profileImageUrl ?? "",
      businessName: c.businessName ?? "Business Name",
      displayName: c.displayName ?? "Name",
      locationText: c.locationText ?? "City, State",
      email: c.email ?? "myemailaddress@konfolio.com",

      links: c.links ?? emptyLinks(),
      merchTags: c.merchTags ?? [],
      previousVends: c.previousVends ?? [],

      images: Array.isArray(c.images) && c.images.length > 0 ? c.images.slice(0, 9) : [],
    }

    // ensure 9 images
    if (draft.images.length < 9) {
      const start = draft.images.length
      for (let i = start; i < 9; i++) {
        draft.images.push({
          id: `cell-${i + 1}`,
          src: "",
          title: "Title",
          description: "Short description",
        })
      }
    }

    return draft
  }

  return {
    id: db.id,
    template: "portrait",
    status,
    updatedAt,
  }
}
