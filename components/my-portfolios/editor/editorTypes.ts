import type { LinkPickerValue } from "@/components/my-portfolios/LinkPicker"

export type TemplateType = "square" | "portrait"

export type SquareCell = {
  id: string
  src?: string
  title?: string
  description?: string
}

export type PortraitCell = {
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

  bannerColor: string
  backgroundColor: string
  bannerSwatches: string[]
  backgroundSwatches: string[]

  profileImageUrl: string
  businessName: string
  displayName: string
  locationText: string
  email: string

  links: LinkPickerValue
  merchTags: string[]
  previousVends: string[]

  images: SquareCell[]
}

export type PortraitDraft = BaseDraft & {
  template: "portrait"

  bannerColor: string
  backgroundColor: string
  bannerSwatches: string[]
  backgroundSwatches: string[]

  profileImageUrl: string
  businessName: string
  displayName: string
  locationText: string
  email: string

  links: LinkPickerValue
  merchTags: string[]
  previousVends: string[]

  images: PortraitCell[] // 8 cells
}

export type KonfolioDraft = SquareDraft | PortraitDraft

export type DraftPatch<T> = Partial<T> & { updatedAt?: number }
