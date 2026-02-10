// components/my-portfolios/editor/adapters/fromProfile.ts
import type { KonfolioDraft, SquareDraft, SquareCell, TemplateType } from "@/components/my-portfolios/editor/editorTypes"
import type { LinkPickerValue } from "@/components/my-portfolios/LinkPicker"

function makeDefaultCells(count: number): SquareCell[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `cell-${i + 1}`,
    src: "",
    title: "Title",
    description: "Short description",
  }))
}

export function emptyLinks(): LinkPickerValue {
  return {
    activeKeys: [],
    linksByKey: {
      website: "",
      shop: "",
      instagram: "",
      x: "",
      facebook: "",
      tumblr: "",
      pixiv: "",
      bluesky: "",
    },
  }
}

export function createDraftFromProfile(args: { id: string; template: TemplateType }): KonfolioDraft {
  const now = Date.now()

  if (args.template === "square") {
    const draft: SquareDraft = {
      id: args.id,
      template: "square",
      status: "draft",
      updatedAt: now,

      bannerColor: "#FFFFFF",
      backgroundColor: "#F7F7F7",
      bannerSwatches: [],
      backgroundSwatches: [],

      profileImageUrl: "",
      businessName: "Business Name",
      displayName: "Name",
      locationText: "City, State",
      email: "myemailaddress@konfolio.com",

      links: emptyLinks(),
      merchTags: [],
      previousVends: [],

      images: makeDefaultCells(9),
    }
    return draft
  }

  return {
    id: args.id,
    template: "portrait",
    status: "draft",
    updatedAt: now,
  }
}
