export type ProfileFormat = "vertical" | "horizontal"
export type ImageFormat = "square" | "portrait"
export type BackgroundMode = "light" | "dark"

export type ProfileFieldKey =
  | "profileImage"
  | "businessName"
  | "name"
  | "links"
  | "merchTags"
  | "previousVends"
  | "location"
  | "email"

export type CustomTemplateConfig = {
  name: string
  profileFormat: ProfileFormat
  profileFields: Record<ProfileFieldKey, boolean>
  imageFormat: ImageFormat
  columns: number
  rows: number
  backgroundMode: BackgroundMode
  lightBackgroundUrl: string
  darkBackgroundUrl: string
  templateCode: string
  slotLabels: string[]
}

export type CustomTemplateFiles = { light?: File; dark?: File }

export const TEMPLATE_NAME_PLACEHOLDER = "Untitled Portfolio Template"

/** Placeholder copy shown in the preview (shared by both profile layouts). */
export const PREVIEW_PLACEHOLDERS = {
  businessName: "Business Name",
  name: "Name",
  tag: "Tag",
  previousVendsLabel: "Previous Vends",
  vendedEvent: "Vended Event",
  vendYear: "2026",
  location: "City, State",
  email: "myaddress@email.com",
} as const

export const PROFILE_FORMAT_OPTIONS: { value: ProfileFormat; label: string }[] = [
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
]

export const PROFILE_FIELDS: { key: ProfileFieldKey; label: string; required?: boolean }[] = [
  { key: "profileImage", label: "Profile Image" },
  { key: "businessName", label: "Business Name", required: true },
  { key: "name", label: "Name" },
  { key: "links", label: "Links" },
  { key: "merchTags", label: "Merchandise Tags" },
  { key: "previousVends", label: "Previous Vends" },
  { key: "location", label: "Location" },
  { key: "email", label: "Email Address" },
]

/* ---------- Image format: cell shape + copy ---------- */
type ImageFormatSpec = {
  label: string
  /** cell height / width */
  ratio: number
  recommended: string
}

export const IMAGE_FORMATS: Record<ImageFormat, ImageFormatSpec> = {
  square: { label: "1×1 Square", ratio: 1, recommended: "Recommended: 7 - 10 images" },
  portrait: { label: "4×5 Portrait", ratio: 5 / 4, recommended: "Recommended: 7 - 10 images" },
}

export const IMAGE_FORMAT_OPTIONS = (Object.keys(IMAGE_FORMATS) as ImageFormat[]).map((value) => ({
  value,
  label: IMAGE_FORMATS[value].label,
}))

/* ---------- Grid: allowed sizes depend on profile layout ---------- */
export const GRID_COLUMN_OPTIONS = [2, 3, 4]
export const GRID_ROW_OPTIONS = [2, 3, 4]

type GridRule = { columns: number[]; rows: number[]; defaults: { columns: number; rows: number } }

// Vertical sidebar leaves a squarish grid area; horizontal banner leaves a wide, short one
export const GRID_RULES: Record<ProfileFormat, GridRule> = {
  vertical: { columns: [2, 3], rows: [3, 4], defaults: { columns: 3, rows: 3 } },
  horizontal: { columns: [3, 4], rows: [2, 3], defaults: { columns: 4, rows: 2 } },
}

/** Keeps the current grid if allowed for the layout, otherwise falls back to its default. */
export function snapGrid(profileFormat: ProfileFormat, columns: number, rows: number) {
  const rule = GRID_RULES[profileFormat]
  const fits = rule.columns.includes(columns) && rule.rows.includes(rows)
  return fits ? { columns, rows } : { ...rule.defaults }
}

export const BACKGROUND_REQUIREMENTS = [
  "Transparent PNG or SVG with a minimum of 1980×1080px (16:9)",
  "Must be in black, white, or grays to allow creative freedom in portfolios",
  "Allow 3-5 business days for our team to review your template",
]

export const DEFAULT_CONFIG: CustomTemplateConfig = {
  name: "",
  profileFormat: "vertical",
  profileFields: {
    profileImage: true,
    businessName: true,
    name: true,
    links: true,
    merchTags: true,
    previousVends: true,
    location: true,
    email: true,
  },
  imageFormat: "square",
  columns: 3,
  rows: 3,
  backgroundMode: "light",
  lightBackgroundUrl: "",
  darkBackgroundUrl: "",
  templateCode: "",
  slotLabels: [],
}

export function sanitizeTemplateCode(raw: string) {
  return raw.replace(/[^a-zA-Z0-9-]/g, "")
}

/**
 * Square: alternates Product / Recent Work, table display in the middle.
 * Portrait: first half Recent Work, then Product, table display last.
 */
export function recommendedLabels(format: ImageFormat, count: number): string[] {
  if (format === "portrait") {
    const half = Math.floor(count / 2)
    return Array.from({ length: count }, (_, i) =>
      i === count - 1 ? "You & Table Display" : i < half ? "Most Recent Work" : "Your Product",
    )
  }

  const center = Math.floor(count / 2)
  return Array.from({ length: count }, (_, i) =>
    i === center ? "You & Table Display" : i % 2 === 0 ? "Your Product" : "Most Recent Work",
  )
}