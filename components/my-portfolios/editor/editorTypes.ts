// components/my-portfolios/editor/editorTypes.ts
import type { LinkPickerValue } from "@/components/my-portfolios/LinkPicker"

export type TemplateType = "square" | "portrait"

export type SquareCell = {
  id: string
  src?: string
  title?: string
  description?: string
}

export type BaseDraft = {
  id: string
  template: TemplateType
  status: "draft" | "published"
  updatedAt: number
}

export type SquareDraft = BaseDraft & {
  template: "square"

  // colors
  bannerColor: string
  backgroundColor: string

  // persisted palettes (persist per draft; start empty for new drafts)
  bannerSwatches: string[]
  backgroundSwatches: string[]

  // profile
  profileImageUrl: string
  businessName: string
  displayName: string
  locationText: string
  email: string

  // sidebar data
  links: LinkPickerValue
  merchTags: string[]
  previousVends: string[]

  // main grid
  images: SquareCell[]
}

export type PortraitDraft = BaseDraft & {
  template: "portrait"
  // TODO later
}

export type KonfolioDraft = SquareDraft | PortraitDraft

export type DraftPatch<T> = Partial<T> & { updatedAt?: number }
