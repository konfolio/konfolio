"use client"

import { Link2 } from "lucide-react"
import ImageIcon from "@/components/icons/ImageIcon"
import LocationIcon from "@/components/icons/LocationIcon"
import { PortfolioField } from "@/components/my-portfolios/PortfolioEditingIndicators"
import {
  IMAGE_FORMATS,
  PREVIEW_PLACEHOLDERS as P,
  recommendedLabels,
  type CustomTemplateConfig,
} from "./customTemplateConfig"

const GAP = 10
const MAX_SLOT_LABEL = 30

// Empty-image placeholder pattern
const CHECKER: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#EDEDED 0 25%, #F7F7F7 0 50%)",
  backgroundSize: "16px 16px",
}

type Fields = CustomTemplateConfig["profileFields"]

/* ---------- Shared bits ---------- */
function PreviewLogo() {
  return (
    <span
      aria-hidden="true"
      className="select-none text-[#262626] opacity-50"
      style={{ fontFamily: "Inknut Antiqua", fontWeight: 600, fontSize: 13, letterSpacing: "-0.02em", lineHeight: 1 }}
    >
      konfolio
    </span>
  )
}

function TagPill() {
  return (
    <span className="rounded-full border border-[#A5A5A5] px-[15px] font-inter text-[13px] leading-[16px] text-[#262626]">
      {P.tag}
    </span>
  )
}

function VendedEvent({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center font-inter text-[13px] leading-[140%]">
      <span className={dark ? "text-white/40" : "text-black/40"}>{P.previousVendsLabel}</span>
      <span className={dark ? "text-white" : "text-[#262626]"}>
        {P.vendedEvent}{" "}
        <span className={`text-[13px] italic ${dark ? "text-white/40" : "text-black/40"}`}>{P.vendYear}</span>
      </span>
    </div>
  )
}

function ContactLines({ f, align }: { f: Fields; align: "center" | "end" }) {
  if (!f.name && !f.location && !f.email) return null
  return (
    <div
      className={`flex flex-col font-inter text-[13px] leading-[140%] text-black/40 ${
        align === "end" ? "items-end text-right" : "items-center text-center"
      }`}
    >
      {f.name && align === "end" ? <span className="text-[#262626]">{P.name}</span> : null}
      {f.location ? (
        <span className="inline-flex items-center gap-[3px]">
          <LocationIcon className="h-[8px] w-[8px]" />
          {P.location}
        </span>
      ) : null}
      {f.email ? <span>{P.email}</span> : null}
    </div>
  )
}

/* ---------- Vertical: sidebar ---------- */
function VerticalProfile({ f }: { f: Fields }) {
  return (
    <div className="flex w-full shrink-0 flex-col items-center bg-white px-5 pb-[30px] pt-[28px] lg:w-[228px] lg:pb-[28px]">
      <PreviewLogo />
      <div className="my-auto flex flex-col items-center pt-[30px] text-center lg:pt-0">
        {f.profileImage ? <div className="h-[136px] w-[136px] rounded-[12px]" style={CHECKER} /> : null}
        <p className="m-0 mt-[8px] font-inter text-[17px] leading-[140%] text-[#262626]">{P.businessName}</p>
        {f.name ? <p className="m-0 font-inter text-[13px] leading-[140%] text-black/40">{P.name}</p> : null}
        {f.links ? <Link2 aria-hidden="true" className="mt-[20px] h-[14px] w-[14px] text-[#262626]" strokeWidth={1.5} /> : null}
        {f.merchTags ? (
          <div className="mt-[20px]">
            <TagPill />
          </div>
        ) : null}
        {f.previousVends ? (
          <div className="mt-[20px]">
            <VendedEvent />
          </div>
        ) : null}
        {f.location || f.email ? (
          <div className="mt-[16px]">
            <ContactLines f={f} align="center" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------- Horizontal: top banner ---------- */
function HorizontalProfile({ f }: { f: Fields }) {
  return (
    <div className="flex w-full shrink-0 flex-wrap items-start justify-between gap-[15px] bg-white px-5 py-[20px] lg:px-[64px]">
      <div className="flex min-w-0 items-start gap-[15px]">
        {f.profileImage ? <div className="h-[72px] w-[72px] shrink-0 rounded-[12px]" style={CHECKER} /> : null}
        <div className="flex min-w-0 flex-col items-start gap-[8px]">
          <p className="m-0 font-inter text-[17px] leading-[140%] text-[#262626]">{P.businessName}</p>
          {f.links ? <Link2 aria-hidden="true" className="h-[14px] w-[14px] text-[#262626]" strokeWidth={1.5} /> : null}
          {f.merchTags ? <TagPill /> : null}
        </div>
      </div>

      <div className="ml-auto flex shrink-0 flex-col items-end gap-[16px]">
        <PreviewLogo />
        <ContactLines f={f} align="end" />
      </div>
    </div>
  )
}

/* ---------- Grid card ---------- */
type PreviewCardProps = {
  index: number
  value: string
  defaultLabel: string
  ratio: number
  dark: boolean
  editable: boolean
  onChange?: (value: string) => void
}

function PreviewCard({ index, value, defaultLabel, ratio, dark, editable, onChange }: PreviewCardProps) {
  const tone = dark ? "text-white/40" : "text-black/40"
  const placeholderTone = dark ? "placeholder:text-white/40" : "placeholder:text-black/40"

  return (
    <div
      style={{ aspectRatio: `1 / ${ratio}` }}
      className={`group/card flex w-full flex-col items-center justify-center gap-[30px] rounded-[12px] border shadow-[2px_4px_25px_rgba(165,165,165,0.1)] ${
        dark ? "border-white/10 bg-white/5" : "border-white bg-[rgba(165,165,165,0.068)]"
      }`}
    >
      <div aria-hidden="true" className="h-[29px] w-[29px] text-[#A5A5A5] [&_path]:fill-[#A5A5A5] [&_path]:stroke-[#A5A5A5]">
        <ImageIcon />
      </div>

      <div className={`flex w-full flex-col items-center px-[10px] gap-[5px] text-center font-roboto ${tone}`}>
        <span className="text-[13px] leading-[11px]">Recommended</span>

        {editable ? (
          // Nudge right by half the indicator width (20px icon + 6px gap) so the text stays centred
          <div className="flex max-w-full translate-x-[13px] justify-center">
            <PortfolioField
              label={`slot ${index + 1} recommendation`}
              editable
              isDark={dark}
              indicatorPlacement="inline"
              revealOnParentHover
            >
              <input
                value={value}
                placeholder={defaultLabel}
                maxLength={MAX_SLOT_LABEL}
                onChange={(e) => onChange?.(e.target.value)}
                aria-label={`Slot ${index + 1} recommendation`}
                className={`min-w-[2ch] bg-transparent text-center font-roboto text-[16px] leading-[15px] outline-none ${tone} ${placeholderTone}`}
              />
            </PortfolioField>
          </div>
        ) : (
          <span className="text-[15px] leading-[15px]">{value || defaultLabel}</span>
        )}
      </div>
    </div>
  )
}

type PreviewProps = {
  config: CustomTemplateConfig
  className?: string
  editable?: boolean
  onChangeSlotLabel?: (index: number, value: string) => void
}

export default function CustomTemplatePreview({ config, className = "", editable = true, onChangeSlotLabel }: PreviewProps) {
  const spec = IMAGE_FORMATS[config.imageFormat]
  const dark = config.backgroundMode === "dark"
  const bgUrl = dark ? config.darkBackgroundUrl : config.lightBackgroundUrl
  const vertical = config.profileFormat === "vertical"
  const f = config.profileFields
  const defaults = recommendedLabels(config.imageFormat, config.columns * config.rows)

  return (
    <section
      aria-label="Template preview"
      className={`flex w-full flex-col overflow-hidden rounded-[15px] shadow-[2px_2px_15px_rgba(0,0,0,0.06)] ${
        vertical ? "lg:flex-row lg:pl-[36px]" : ""
      } ${className}`}
      style={{
        backgroundColor: dark ? "#262626" : "#F7F7F7",
        backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {vertical ? <VerticalProfile f={f} /> : <HorizontalProfile f={f} />}

      {/* Scrolls on laptop when the rows don't fit; centred vertically when they do */}
      <div
        className={`flex min-h-0 min-w-0 max-w-[770px] flex-1 flex-col p-[10px] lg:overflow-y-auto lg:[scrollbar-gutter:stable] ${
            vertical ? "lg:py-[20px] lg:pl-[15px] lg:pr-[20px]" : "lg:px-[64px] lg:pb-0 lg:pt-[14px]"
        }`}
        >
        <div className="my-auto w-full">
            <div
            className="grid w-full"
            style={{ gap: GAP, gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))` }}
            >
            {defaults.map((defaultLabel, i) => (
                <PreviewCard
                key={i}
                index={i}
                value={config.slotLabels[i] ?? ""}
                defaultLabel={defaultLabel}
                ratio={spec.ratio}
                dark={dark}
                editable={editable && Boolean(onChangeSlotLabel)}
                onChange={(v) => onChangeSlotLabel?.(i, v)}
                />
            ))}
            </div>

            {/* Horizontal layout: previous vends stay with the grid */}
            {!vertical && f.previousVends ? (
            <div className="pb-[20px] pt-[18px]">
                <VendedEvent dark={dark} />
            </div>
            ) : null}
        </div>
      </div>
    </section>
  )
}