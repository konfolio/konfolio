// components/my-portfolios/editor/adapters/toPayload.ts
import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"

export type KonfolioUpdatePayload = {
  template: "square" | "portrait"
  status: "draft" | "published"
  content: Record<string, any>
}

export function toPayload(draft: KonfolioDraft): KonfolioUpdatePayload {
  const shared = {
    bannerColor: draft.bannerColor,
    backgroundColor: draft.backgroundColor,
    bannerSwatches: draft.bannerSwatches,
    backgroundSwatches: draft.backgroundSwatches,

    profileImageUrl: draft.profileImageUrl,
    businessName: draft.businessName,
    displayName: draft.displayName,
    locationText: draft.locationText,
    email: draft.email,

    links: draft.links,
    merchTags: draft.merchTags,
    previousVends: draft.previousVends,
  }

  if (draft.template === "square") {
    return {
      template: "square",
      status: draft.status,
      content: {
        ...shared,
        images: draft.images,
      },
    }
  }

  // portrait
  return {
    template: "portrait",
    status: draft.status,
    content: {
      ...shared,
      images: draft.images,
    },
  }
}
