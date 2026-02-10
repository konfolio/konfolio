import type { KonfolioDraft, SquareCell, PortraitCell, SquareDraft, PortraitDraft } from "@/components/my-portfolios/editor/editorTypes"
import type { LinkPickerValue } from "@/components/my-portfolios/LinkPicker"

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

export function createDraftFromProfile(params: { id: string; template: "square" | "portrait" }): KonfolioDraft {
  const base = {
    id: params.id,
    status: "draft" as const,
    updatedAt: Date.now(),
  }

  if (params.template === "square") {
    const d: SquareDraft = {
      ...base,
      template: "square",
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
      images: makeDefaultSquareCells(),
    }
    return d
  }

  const d: PortraitDraft = {
    ...base,
    template: "portrait",
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
    images: makeDefaultPortraitCells(),
  }
  return d
}
