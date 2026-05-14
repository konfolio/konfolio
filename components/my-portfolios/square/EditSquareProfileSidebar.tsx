// components/my-portfolios/square/EditSquareProfileSidebar.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import ArrowDown from "@/components/icons/ArrowDown"
import ImageIcon from "@/components/icons/ImageIcon"
import SecondaryButton from "@/components/buttons/SecondaryButton"

import BrushIcon from "@/components/icons/BrushIcon"
import LocationIcon from "@/components/icons/LocationIcon"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"

import HomeIcon from "@/components/icons/HomeIcon"
import ShopIcon from "@/components/icons/ShopIcon"
import InstagramIcon from "@/components/icons/InstagramIcon"
import XIcon from "@/components/icons/XIcon"
import FacebookIcon from "@/components/icons/FacebookIcon"
import TumblrIcon from "@/components/icons/TumblrIcon"
import PixivIcon from "@/components/icons/PixivIcon"
import BlueskyIcon from "@/components/icons/BlueskyIcon"

import MerchTagPicker from "@/components/my-portfolios/MerchTagPicker"
import LinkPicker, { type LinkPickerValue } from "@/components/my-portfolios/LinkPicker"
import ColorPicker from "@/components/my-portfolios/ColorPicker"

type Props = {
  editable?: boolean
  mobileCollapsed?: boolean
  mobileExpanded?: boolean
  onToggleMobile?: () => void

  backHref: string
  onBack?: () => void

  bannerColor?: string
  backgroundColor?: string
  onChangeBannerColor?: (hex: string) => void
  onChangeBackgroundColor?: (hex: string) => void

  bannerSwatches?: string[]
  backgroundSwatches?: string[]
  onChangeBannerSwatches?: (next: string[]) => void
  onChangeBackgroundSwatches?: (next: string[]) => void

  profileImageUrl?: string
  onChangeProfileImage?: (file: File, objectUrl: string) => void

  businessName?: string
  displayName?: string
  onChangeBusinessName?: (val: string) => void
  onChangeDisplayName?: (val: string) => void

  showAddLink?: boolean
  onAddLinkClick?: () => void

  linksValue?: LinkPickerValue
  onChangeLinks?: (next: LinkPickerValue) => void

  showMerchTag?: boolean
  onMerchClick?: () => void

  merchTags?: string[]
  onChangeMerchTags?: (next: string[]) => void

  previousVends?: string[]
  onChangePreviousVends?: (vals: string[]) => void

  locationText?: string
  email?: string
  onChangeLocationText?: (val: string) => void
  onChangeEmail?: (val: string) => void

  publishLabel?: string
  onPublish?: () => void
  onOpenPreview?: () => void
}

function parseEventLine(line: string): { title: string; year?: string } {
  const trimmed = (line || "").trim()
  if (!trimmed) return { title: "" }

  const m = trimmed.match(/^(.*?)(?:\s*\(?(\d{4})\)?)\s*$/)
  if (!m) return { title: trimmed }

  const maybeTitle = (m[1] ?? "").trim()
  const maybeYear = m[2]

  if (maybeYear && maybeTitle.length > 0) return { title: maybeTitle, year: maybeYear }
  return { title: trimmed }
}

type OpenPicker = "banner" | "background" | null

function safeStr(x: any) {
  return String(x ?? "").trim()
}

function isDarkHexColor(hex: string) {
  const clean = String(hex || "").replace("#", "").trim()

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean

  if (full.length !== 6) return false

  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)

  if ([r, g, b].some((n) => Number.isNaN(n))) return false

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

function normalizeUrl(raw: string): string {
  const v = safeStr(raw)
  if (!v) return ""
  const lower = v.toLowerCase()
  if (lower.startsWith("http://") || lower.startsWith("https://")) return v
  return `https://${v}`
}

function getActiveLinkUrls(value: LinkPickerValue | undefined): Array<{ key: string; url: string }> {
  const v: any = value as any
  if (!v) return []

  const activeKeys: string[] = Array.isArray(v.activeKeys) ? v.activeKeys : []
  const linksByKey: Record<string, string> =
    v.linksByKey && typeof v.linksByKey === "object" ? (v.linksByKey as Record<string, string>) : {}

  return activeKeys
    .map((k) => ({ key: k, url: normalizeUrl(linksByKey[k] ?? "") }))
    .filter((x) => Boolean(x.url))
}

function iconLabelForKey(key: string) {
  if (key === "website") return "Website"
  if (key === "shop") return "Shop"
  if (key === "instagram") return "Instagram"
  if (key === "x") return "X"
  if (key === "facebook") return "Facebook"
  if (key === "tumblr") return "Tumblr"
  if (key === "pixiv") return "Pixiv"
  if (key === "bluesky") return "Bluesky"
  return "Link"
}

function IconForKey({ k }: { k: string }) {
  if (k === "website") return <HomeIcon className="w-[24px] h-[24px]" />
  if (k === "shop") return <ShopIcon className="w-[24px] h-[24px]" />
  if (k === "instagram") return <InstagramIcon className="w-[24px] h-[24px]" />
  if (k === "x") return <XIcon className="w-[24px] h-[24px]" />
  if (k === "facebook") return <FacebookIcon className="w-[24px] h-[24px]" />
  if (k === "tumblr") return <TumblrIcon className="w-[24px] h-[24px]" />
  if (k === "pixiv") return <PixivIcon className="w-[24px] h-[24px]" />
  if (k === "bluesky") return <BlueskyIcon className="w-[24px] h-[24px]" />
  return <HomeIcon className="w-[24px] h-[24px]" />
}

function KonfolioLogo({ primaryTextColor }: { primaryTextColor: string }) {
  return (
    <div
      aria-label="Konfolio"
      className="absolute left-1/2 -translate-x-1/2 top-[30px] w-[84px] h-[18.67px] opacity-50 pointer-events-none select-none"
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0"
        style={{
          fontFamily: "Inknut Antiqua",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "18.1193px",
          letterSpacing: "-0.02em",
          lineHeight: "18.67px",
          color: primaryTextColor,
          whiteSpace: "nowrap",
        }}
      >
        konfolio
      </div>
    </div>
  )
}

export default function EditSquareProfileSidebar({
  editable = true,
  mobileCollapsed = false,
  mobileExpanded = false,
  onToggleMobile,

  backHref,
  onBack,

  bannerColor = "#FFFFFF",
  backgroundColor = "#F7F7F7",
  onChangeBannerColor,
  onChangeBackgroundColor,

  bannerSwatches = [],
  backgroundSwatches = [],
  onChangeBannerSwatches,
  onChangeBackgroundSwatches,

  profileImageUrl,
  onChangeProfileImage,

  businessName = "Business Name",
  displayName = "Your Name",
  onChangeBusinessName,
  onChangeDisplayName,

  showAddLink = true,
  onAddLinkClick,
  linksValue,
  onChangeLinks,

  showMerchTag = true,
  onMerchClick,
  merchTags,
  onChangeMerchTags,

  previousVends,
  onChangePreviousVends,

  locationText = "City, State",
  email = "myemailaddress@konfolio.com",
  onChangeLocationText,
  onChangeEmail,

  publishLabel = "Publish",
  onPublish,
  onOpenPreview,
}: Props) {
  const [localBusiness, setLocalBusiness] = useState(businessName)
  const [localDisplay, setLocalDisplay] = useState(displayName)
  const [localLocation, setLocalLocation] = useState(locationText)
  const [localEmail, setLocalEmail] = useState(email)

  useEffect(() => setLocalBusiness(businessName), [businessName])
  useEffect(() => setLocalDisplay(displayName), [displayName])
  useEffect(() => setLocalLocation(locationText), [locationText])
  useEffect(() => setLocalEmail(email), [email])

  const [localPrevVends, setLocalPrevVends] = useState<string[]>([])
  const [newVend, setNewVend] = useState("")
  const addInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (previousVends === undefined) return
    setLocalPrevVends(previousVends.slice(0, 4))
  }, [previousVends])

  const pushPrevVends = (next: string[]) => {
    const trimmed = next.map((s) => s.trim()).filter(Boolean).slice(0, 4)
    setLocalPrevVends(trimmed)
    onChangePreviousVends?.(trimmed)
  }

  const addVend = (raw: string) => {
    const text = (raw || "").trim()
    if (!text) return
    if (localPrevVends.length >= 4) return
    pushPrevVends([...localPrevVends, text])
    setNewVend("")
    addInputRef.current?.focus()
  }

  const deleteVendAt = (idx: number) => {
    const next = localPrevVends.filter((_, i) => i !== idx)
    pushPrevVends(next)
  }

  const parsedPrevVends = useMemo(() => localPrevVends.map(parseEventLine), [localPrevVends])
  const showPrevVendsSection = editable || localPrevVends.length > 0

  const [localBanner, setLocalBanner] = useState(bannerColor)
  const [localBg, setLocalBg] = useState(backgroundColor)
  useEffect(() => setLocalBanner(bannerColor), [bannerColor])
  useEffect(() => setLocalBg(backgroundColor), [backgroundColor])

  const [localBannerSwatches, setLocalBannerSwatches] = useState<string[]>(bannerSwatches)
  const [localBgSwatches, setLocalBgSwatches] = useState<string[]>(backgroundSwatches)
  useEffect(() => setLocalBannerSwatches(bannerSwatches), [bannerSwatches])
  useEffect(() => setLocalBgSwatches(backgroundSwatches), [backgroundSwatches])

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null)

  const colorPopoverRef = useRef<HTMLDivElement | null>(null)
  const colorButtonsWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openPicker) return

    const onDown = (e: MouseEvent | PointerEvent) => {
      const pop = colorPopoverRef.current
      const btnWrap = colorButtonsWrapRef.current
      const target = e.target as Node | null

      if (!target) return
      if (pop?.contains(target)) return
      if (btnWrap?.contains(target)) return

      setOpenPicker(null)
    }

    window.addEventListener("pointerdown", onDown)
    return () => window.removeEventListener("pointerdown", onDown)
  }, [openPicker])

  const togglePicker = (which: Exclude<OpenPicker, null>) => {
    setOpenPicker((prev) => (prev === which ? null : which))
  }

  const pickerLabel = openPicker === "banner" ? "Banner Color" : "Background Color"
  const pickerHex = openPicker === "banner" ? localBanner : localBg
  const pickerSwatches = openPicker === "banner" ? localBannerSwatches : localBgSwatches

  const setPickerHex = (hex: string) => {
    if (!editable) return

    if (openPicker === "banner") {
      setLocalBanner(hex)
      onChangeBannerColor?.(hex)
    } else if (openPicker === "background") {
      setLocalBg(hex)
      onChangeBackgroundColor?.(hex)
    }
  }

  const setPickerSwatches = (next: string[]) => {
    if (!editable) return

    if (openPicker === "banner") {
      setLocalBannerSwatches(next)
      onChangeBannerSwatches?.(next)
    } else if (openPicker === "background") {
      setLocalBgSwatches(next)
      onChangeBackgroundSwatches?.(next)
    }
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [localImgUrl, setLocalImgUrl] = useState(profileImageUrl || "")
  const objectUrls = useRef<string[]>([])

  useEffect(() => setLocalImgUrl(profileImageUrl || ""), [profileImageUrl])

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u))
      objectUrls.current = []
    }
  }, [])

  const openFilePicker = () => {
    if (!editable) return
    fileInputRef.current?.click()
  }

  const handleFile = (file: File) => {
    if (!editable) return
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    setLocalImgUrl(url)
    onChangeProfileImage?.(file, url)
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editable) return
    const file = e.target.files?.[0]
    if (!file) return
    handleFile(file)
    e.target.value = ""
  }

  const onDrop = (e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    handleFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
  }

  const activeLinks = useMemo(() => getActiveLinkUrls(linksValue), [linksValue])

  const bannerIsDark = useMemo(() => isDarkHexColor(localBanner), [localBanner])
  const backgroundIsDark = useMemo(() => isDarkHexColor(localBg), [localBg])
  
  const primaryTextClass = bannerIsDark ? "text-white" : "text-[#262626]"
  const primaryStrokeClass = bannerIsDark
    ? "[&_path]:stroke-white"
    : "[&_path]:stroke-[#262626]"
  const primaryTextColor = bannerIsDark ? "#FFFFFF" : "#262626"
  const primaryIconPathClass = bannerIsDark
    ? "[&_path]:stroke-white [&_path]:fill-white"
    : "[&_path]:stroke-[#262626] [&_path]:fill-[#262626]"
  const primarySocialIconClass = bannerIsDark
    ? "[&_svg]:text-white [&_path]:!stroke-white [&_path]:!fill-white [&_circle]:!stroke-white [&_circle]:!fill-white"
    : "[&_svg]:text-[#262626] [&_path]:!stroke-[#262626] [&_path]:!fill-[#262626] [&_circle]:!stroke-[#262626] [&_circle]:!fill-[#262626]"

  if (mobileCollapsed) {
    return (
      <section
        className="flex w-full flex-col px-[20px] py-[20px] text-left lg:hidden"
        style={{ backgroundColor: localBanner }}
        aria-expanded={mobileExpanded}
      >
        <div className="flex w-full items-center justify-between gap-[15px]">
          <div className="flex min-w-0 items-center gap-[15px]">
            <button
              type="button"
              aria-label="Profile image"
              onClick={editable ? openFilePicker : undefined}
              onDrop={onDrop}
              onDragOver={onDragOver}
              className={[
                "relative h-[45px] w-[45px] shrink-0 overflow-hidden rounded-[10px] bg-white/10",
                editable ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileInputChange}
              />

              {localImgUrl ? (
                <img
                  src={localImgUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#A5A5A5]">
                  <ImageIcon />
                </div>
              )}
            </button>

            {editable ? (
              <input
                value={localBusiness}
                onChange={(e) => {
                  setLocalBusiness(e.target.value)
                  onChangeBusinessName?.(e.target.value)
                }}
                placeholder="Business Name"
                className={[
                  "min-w-0 flex-1 bg-transparent text-left font-inter text-[22px] font-normal leading-[140%] placeholder:text-[#A5A5A5] outline-none",
                  primaryTextClass,
                ].join(" ")}
              />
            ) : (
              <p
                className={[
                  "m-0 min-w-0 flex-1 truncate text-left font-inter text-[22px] font-normal leading-[140%]",
                  primaryTextClass,
                ].join(" ")}
              >
                {safeStr(localBusiness) || "Business Name"}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Open full profile"
            onClick={onToggleMobile}
            className={[
              "flex h-[32px] w-[32px] shrink-0 items-center justify-center transition-transform cursor-pointer",
              primaryStrokeClass,
              mobileExpanded ? "rotate-180" : "",
            ].join(" ")}
          >
            <ArrowDown className="h-[20px] w-[20px]" />
          </button>
        </div>

        {mobileExpanded ? (
          <div className="mt-[18px] flex w-full flex-col items-start gap-[18px]">
            {editable ? (
              <div ref={colorButtonsWrapRef} className="relative flex items-center gap-[5px]">
                <BrushIcon
                  className={[
                    "h-[16px] w-[16px]",
                    bannerIsDark ? "text-white" : "text-[#262626]",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() => togglePicker("banner")}
                  aria-label="Pick banner color"
                  className="relative h-[36px] w-[36px] overflow-hidden rounded-full border border-[rgba(165,165,165,0.5)] bg-white cursor-pointer"
                >
                  <span className="absolute inset-0" style={{ backgroundColor: localBanner }} />
                </button>

                <button
                  type="button"
                  onClick={() => togglePicker("background")}
                  aria-label="Pick background color"
                  className="relative h-[36px] w-[36px] overflow-hidden rounded-full border border-[rgba(165,165,165,0.5)] bg-white cursor-pointer"
                >
                  <span className="absolute inset-0" style={{ backgroundColor: localBg }} />
                </button>

                {openPicker ? (
                  <div ref={colorPopoverRef} className="absolute left-0 top-[48px] z-[120] w-[276px]">
                    <ColorPicker
                      label={pickerLabel}
                      valueHex={pickerHex}
                      onChangeHex={setPickerHex}
                      swatches={pickerSwatches}
                      onChangeSwatches={setPickerSwatches}
                      onRequestClose={() => setOpenPicker(null)}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {editable ? (
              <input
                value={localDisplay}
                onChange={(e) => {
                  setLocalDisplay(e.target.value)
                  onChangeDisplayName?.(e.target.value)
                }}
                placeholder="Your Name"
                className="w-full bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
              />
            ) : (
              <p className="m-0 w-full text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5]">
                {safeStr(localDisplay) || "Your Name"}
              </p>
            )}

            <div className="flex w-full items-center gap-[5px] text-[#A5A5A5]">
              <LocationIcon className="h-[12px] w-[12px] shrink-0" />

              {editable ? (
                <input
                  value={localLocation}
                  onChange={(e) => {
                    setLocalLocation(e.target.value)
                    onChangeLocationText?.(e.target.value)
                  }}
                  placeholder="City, State"
                  className="min-w-0 flex-1 bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5]">
                  {safeStr(localLocation) || "City, State"}
                </span>
              )}
            </div>

            {editable ? (
              <input
                value={localEmail}
                onChange={(e) => {
                  setLocalEmail(e.target.value)
                  onChangeEmail?.(e.target.value)
                }}
                placeholder="myemailaddress@konfolio.com"
                className="w-full bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
              />
            ) : (
              <p className="m-0 w-full text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5]">
                {safeStr(localEmail) || "myemailaddress@konfolio.com"}
              </p>
            )}

            <div className="flex w-full justify-start">
              {editable ? (
                <LinkPicker
                  onAddLinkClick={onAddLinkClick}
                  value={linksValue}
                  onChange={onChangeLinks}
                  bannerIsDark={bannerIsDark}
                />
              ) : (
                <div className="flex items-center justify-start gap-[10px]">
                  {activeLinks.map((l) => (
                    <a
                      key={l.key}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={iconLabelForKey(l.key)}
                      className={[
                        "w-[24px] h-[24px] flex items-center justify-center cursor-pointer",
                        primarySocialIconClass,
                      ].join(" ")}
                    >
                      <IconForKey k={l.key} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col items-start gap-[8px]">
              {editable ? (
                <MerchTagPicker
                  maxTags={8}
                  onMerchClick={onMerchClick}
                  value={merchTags}
                  onChange={onChangeMerchTags}
                  layout="inlineLeft"
                  isDarkBanner={bannerIsDark}
                />
              ) : (
                <div className="flex w-full flex-wrap justify-start gap-[10px]">
                  {(Array.isArray(merchTags) ? merchTags : []).slice(0, 8).map((t) => (
                    <div
                      key={t}
                      className={[
                        "flex h-[24px] items-center justify-center rounded-full border border-[0.5px] px-[20px] py-[7px]",
                        bannerIsDark ? "border-white/30" : "border-[#A5A5A5]/50",
                      ].join(" ")}
                      style={{
                        backgroundColor: bannerIsDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "transparent",
                      }}
                    >
                      <span
                        className={[
                          "font-inter text-[15px] font-normal leading-[150%]",
                          primaryTextClass,
                        ].join(" ")}
                      >
                        {safeStr(t)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showPrevVendsSection ? (
              <div className="flex w-full flex-col items-start gap-[10px]">
                <p className="m-0 font-inter text-[15px] leading-[140%] text-[#A5A5A5]">
                  Previous Vends
                </p>

                {parsedPrevVends.map((ev, i) => (
                  <div key={`${ev.title}-${ev.year ?? ""}-${i}`} className="group flex items-center gap-[8px]">
                    <span
                      className={[
                        "font-inter text-[15px] leading-[140%]",
                        primaryTextClass,
                      ].join(" ")}
                    >
                      {ev.title}
                    </span>
                    {ev.year ? (
                      <span className="font-inter text-[12px] italic leading-[140%] text-[#A5A5A5]">
                        {ev.year}
                      </span>
                    ) : null}

                    {editable ? (
                      <button
                        type="button"
                        aria-label="Delete event"
                        onClick={() => deleteVendAt(i)}
                        className="text-[#A5A5A5] cursor-pointer"
                      >
                        <DeleteIcon className="h-[14px] w-[14px]" />
                      </button>
                    ) : null}
                  </div>
                ))}

                {editable && localPrevVends.length < 4 ? (
                  <input
                    ref={addInputRef}
                    value={newVend}
                    onChange={(e) => setNewVend(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addVend(newVend)
                      }
                    }}
                    placeholder={localPrevVends.length > 0 ? "Type an event..." : "Vended Event 2026"}
                    className="w-full bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#D3D3D3] placeholder:text-[#D3D3D3] outline-none"
                  />
                ) : null}
              </div>
            ) : null}

            {editable ? (
              <div className="flex w-full items-center justify-start gap-[10px] pt-[4px]">
                <SecondaryButton
                  onClick={onPublish}
                  className={
                    bannerIsDark
                      ? "border-white text-white"
                      : "border-[#262626] text-[#262626]"
                  }
                >
                  {publishLabel}
                </SecondaryButton>

                <button
                  type="button"
                  aria-label="Open preview"
                  onClick={onOpenPreview}
                  className={[
                    "flex h-[30px] w-[30px] items-center justify-center rounded-full border cursor-pointer",
                    bannerIsDark ? "border-white" : "border-[#262626]",
                  ].join(" ")}
                >
                  <OpenTabIcon
                    className={[
                      "h-[16px] w-[16px]",
                      bannerIsDark ? "[&_path]:stroke-white" : "[&_path]:stroke-[#262626]",
                    ].join(" ")}
                  />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <aside
      className="relative flex w-full max-w-[316px] flex-col items-center gap-[10px] px-[20px] py-[30px] lg:min-h-[982px] lg:py-[40px]"
      style={{ backgroundColor: localBanner }}
    >
      {editable ? (
        <div className="relative flex h-[36px] w-full max-w-[276px] items-center justify-center gap-[40px]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <button
              type="button"
              aria-label="Back"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onBack) onBack()
                else window.location.href = backHref
              }}
              className={[
                "w-[30px] h-[30px] flex items-center justify-center cursor-pointer",
                primaryStrokeClass,
              ].join(" ")}
            >
              <ArrowLeft className="w-[30px] h-[30px]" />
            </button>
          </div>

          <div
            ref={colorButtonsWrapRef}
            className="relative flex items-center justify-end gap-[5px] w-[98px] h-[36px]"
          >
            <div
              className={[
                "w-[16px] h-[16px] flex items-center justify-center",
                bannerIsDark ? "text-white" : "text-[#262626]",
              ].join(" ")}
            >
              <BrushIcon className="w-[16px] h-[16px]" />
            </div>

            <button
              type="button"
              onClick={() => togglePicker("banner")}
              aria-label="Pick banner color"
              className="w-[36px] h-[36px] rounded-full border border-[rgba(165,165,165,0.5)] bg-white cursor-pointer relative overflow-hidden"
            >
              <span className="absolute inset-0" style={{ backgroundColor: localBanner }} />
            </button>

            <button
              type="button"
              onClick={() => togglePicker("background")}
              aria-label="Pick background color"
              className="w-[36px] h-[36px] rounded-full border border-[rgba(165,165,165,0.5)] bg-white cursor-pointer relative overflow-hidden"
            >
              <span className="absolute inset-0" style={{ backgroundColor: localBg }} />
            </button>

            {openPicker ? (
              <div
                ref={colorPopoverRef}
                className="absolute z-[200] top-[52px] left-1/2 -translate-x-1/2 w-[276px]"
              >
                <ColorPicker
                  label={pickerLabel}
                  valueHex={pickerHex}
                  onChangeHex={setPickerHex}
                  swatches={pickerSwatches}
                  onChangeSwatches={setPickerSwatches}
                  onRequestClose={() => setOpenPicker(null)}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <KonfolioLogo primaryTextColor={primaryTextColor} />
          <div className="h-[24px] w-[276px]" />
        </>
      )}

      <div className="w-full max-w-[276px] flex-1 flex flex-col items-center justify-center gap-[30px]">
        <div
          className={[
            "relative w-[189px] h-[189px] bg-white border border-[#A5A5A5] border-[0.5px] rounded-[15px] overflow-hidden",
            editable ? "cursor-pointer" : "cursor-default",
          ].join(" ")}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInputChange}
          />

          {editable ? (
            <button
              type="button"
              className="absolute inset-0 cursor-pointer"
              aria-label="Upload profile image"
              onClick={openFilePicker}
            >
              <span className="sr-only">Upload</span>
            </button>
          ) : null}

          {localImgUrl ? (
            <img
              src={localImgUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          ) : null}

          {!localImgUrl && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[5px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center text-[#A5A5A5] [&_path]:stroke-[#A5A5A5] [&_path]:fill-[#A5A5A5]">
                <ImageIcon />
              </div>
              <p className="m-0 w-[140px] font-inter font-normal text-[11px] leading-[13px] text-center text-[#A5A5A5]">
                {editable ? "Drop image here or click to open files" : ""}
              </p>
            </div>
          )}
        </div>

        <div className="w-full max-w-[276px] flex flex-col items-center gap-[12px]">
          {editable ? (
            <input
              value={localBusiness}
              onChange={(e) => {
                setLocalBusiness(e.target.value)
                onChangeBusinessName?.(e.target.value)
              }}
              placeholder="Business Name"
              className={[
                "w-full text-center font-inter font-normal text-[22px] leading-[140%] placeholder:text-[#A5A5A5] bg-transparent outline-none",
                primaryTextClass,
              ].join(" ")}
            />
          ) : (
            <p
              className={[
                "m-0 w-full text-center font-inter font-normal text-[22px] leading-[140%]",
                primaryTextClass,
              ].join(" ")}
            >
              {safeStr(localBusiness) || "Business Name"}
            </p>
          )}

          {editable ? (
            <input
              value={localDisplay}
              onChange={(e) => {
                setLocalDisplay(e.target.value)
                onChangeDisplayName?.(e.target.value)
              }}
              placeholder="Your Name"
              className="w-full text-center font-inter font-normal text-[15px] leading-[140%] text-[rgba(165,165,165,0.5)] placeholder:text-[rgba(165,165,165,0.5)] bg-transparent outline-none"
            />
          ) : (
            <p className="m-0 w-full text-center font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
              {safeStr(localDisplay) || "Your Name"}
            </p>
          )}
        </div>

        <div className="w-full max-w-[276px] flex items-center justify-center">
          {editable ? (
            showAddLink ? (
              <LinkPicker onAddLinkClick={onAddLinkClick} value={linksValue} onChange={onChangeLinks} bannerIsDark={bannerIsDark}/>
            ) : null
          ) : (
            <div className="flex items-center justify-center gap-[10px]">
              {activeLinks.map((l) => (
                <a
                  key={l.key}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={iconLabelForKey(l.key)}
                  className={[
                    "w-[24px] h-[24px] flex items-center justify-center cursor-pointer",
                    primarySocialIconClass,
                  ].join(" ")}
                >
                  <IconForKey k={l.key} />
                </a>
              ))}
            </div>
          )}
        </div>

        {editable ? (
          showMerchTag ? (
            <div className="relative z-[20] w-[276px] flex justify-center">
              <MerchTagPicker
                maxTags={8}
                onMerchClick={onMerchClick}
                value={merchTags}
                onChange={onChangeMerchTags}
                isDarkBanner={bannerIsDark}
              />
            </div>
          ) : null
        ) : (
          <div className="w-full max-w-[276px] flex flex-wrap justify-center gap-[10px]">
            {(Array.isArray(merchTags) ? merchTags : []).slice(0, 8).map((t) => (
              <div
                key={t}
                className={[
                  "flex h-[24px] items-center justify-center rounded-full border border-[0.5px] px-[20px] py-[7px]",
                  bannerIsDark ? "border-white/30" : "border-[#A5A5A5]/50",
                ].join(" ")}
                style={{
                  backgroundColor: bannerIsDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                }}
              >
                <span
                  className={[
                    "font-inter font-normal text-[15px] leading-[150%]",
                    primaryTextClass,
                  ].join(" ")}
                >
                  {safeStr(t)}
                </span>
              </div>
            ))}
          </div>
        )}

        {showPrevVendsSection ? (
          <div className="relative z-[10] w-[276px] flex flex-col items-center gap-[12px]">
            <p className="m-0 w-full text-center font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
              Previous Vends
            </p>

            <div className="w-full flex flex-col items-center gap-[6px]">
              {parsedPrevVends.map((ev, i) => (
                <div key={`${ev.title}-${ev.year ?? ""}-${i}`} className="group relative w-full flex justify-center">
                  <div className="flex items-baseline gap-[6px]">
                    <span
                      className={[
                        "font-inter font-normal text-[15px] leading-[140%]",
                        primaryTextClass,
                      ].join(" ")}
                    >
                      {ev.title || ""}
                    </span>
                    {ev.year ? (
                      <span className="font-inter italic font-normal text-[12px] leading-[140%] text-[#A5A5A5]">
                        {ev.year}
                      </span>
                    ) : null}
                  </div>

                  {editable ? (
                    <button
                      type="button"
                      aria-label="Delete event"
                      className="
                        absolute right-[12px] top-1/2 -translate-y-1/2
                        opacity-0 transition-opacity
                        group-hover:opacity-100
                        text-[#A5A5A5]
                        [&_path]:fill-[#A5A5A5]
                        [&_path]:stroke-[#A5A5A5]
                        cursor-pointer
                      "
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVendAt(i)
                      }}
                    >
                      <DeleteIcon className="w-[14px] h-[14px]" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {editable && localPrevVends.length < 4 ? (
              <input
                ref={addInputRef}
                value={newVend}
                onChange={(e) => setNewVend(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addVend(newVend)
                  }
                }}
                placeholder={localPrevVends.length > 0 ? "Type an event..." : "Vended Event 2026"}
                className="
                  w-full
                  text-center
                  font-inter font-normal
                  text-[15px] leading-[140%]
                  text-[#D3D3D3]
                  placeholder:text-[#D3D3D3]
                  bg-transparent
                  outline-none
                "
              />
            ) : null}
          </div>
        ) : null}

        <div className="w-full max-w-[276px] flex flex-col items-center gap-[12px]">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-[5px]">
              <div className="w-[12px] h-[12px] flex items-center justify-center text-[#A5A5A5]">
                <LocationIcon className="w-[12px] h-[12px]" />
              </div>

              {editable ? (
                <input
                  value={localLocation}
                  onChange={(e) => {
                    setLocalLocation(e.target.value)
                    onChangeLocationText?.(e.target.value)
                  }}
                  placeholder="City, State"
                  size={Math.max(localLocation.length || 0, 8)}
                  className="
                    w-auto
                    text-center
                    font-inter font-normal
                    text-[15px] leading-[140%]
                    text-[#A5A5A5]
                    placeholder:text-[#A5A5A5]
                    bg-transparent
                    outline-none
                  "
                />
              ) : (
                <span className="font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
                  {safeStr(localLocation)}
                </span>
              )}
            </div>
          </div>

          {editable ? (
            <input
              value={localEmail}
              onChange={(e) => {
                setLocalEmail(e.target.value)
                onChangeEmail?.(e.target.value)
              }}
              placeholder="myemailaddress@konfolio.com"
              className="
                w-full
                text-center
                font-inter font-normal
                text-[15px] leading-[140%]
                text-[#A5A5A5]
                placeholder:text-[#A5A5A5]
                bg-transparent
                outline-none
              "
            />
          ) : (
            <p className="m-0 w-full text-center font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
              {safeStr(localEmail)}
            </p>
          )}
        </div>
      </div>

      {editable ? (
        <div className="w-full max-w-[276px] h-[30px] flex items-center justify-center gap-[10px]">
          <SecondaryButton
            onClick={onPublish}
            className={
              bannerIsDark
                ? "text-white border-white"
                : "text-[#262626] border-[#262626]"
            }
          >
            {publishLabel}
          </SecondaryButton>

          <button
            type="button"
            aria-label="Open preview"
            onClick={onOpenPreview}
            className={[
              "w-[30px] h-[30px] rounded-full flex items-center justify-center cursor-pointer border",
              bannerIsDark ? "border-white" : "border-[#262626]",
            ].join(" ")}
          >
            <OpenTabIcon
              className={[
                "w-[16px] h-[16px]",
                bannerIsDark ? "[&_path]:stroke-white" : "[&_path]:stroke-[#262626]",
              ].join(" ")}
            />
          </button>
        </div>
      ) : null}
    </aside>
  )
}