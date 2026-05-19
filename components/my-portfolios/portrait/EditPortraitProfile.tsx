// components/my-portfolios/portrait/EditPortraitProfile.tsx
"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import ArrowLeft from "@/components/icons/ArrowLeft"
import ArrowDown from "@/components/icons/ArrowDown"
import ImageIcon from "@/components/icons/ImageIcon"
import BrushIcon from "@/components/icons/BrushIcon"
import LocationIcon from "@/components/icons/LocationIcon"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import SecondaryButton from "@/components/buttons/SecondaryButton"
import DeleteIcon from "@/components/icons/DeleteIcon"
import Link from "next/link"

import HomeIcon from "@/components/icons/HomeIcon"
import ShopIcon from "@/components/icons/ShopIcon"
import InstagramIcon from "@/components/icons/InstagramIcon"
import XIcon from "@/components/icons/XIcon"
import FacebookIcon from "@/components/icons/FacebookIcon"
import TumblrIcon from "@/components/icons/TumblrIcon"
import PixivIcon from "@/components/icons/PixivIcon"
import BlueskyIcon from "@/components/icons/BlueskyIcon"

import ColorPicker from "@/components/my-portfolios/ColorPicker"
import LinkPicker, { type LinkPickerValue } from "@/components/my-portfolios/LinkPicker"
import MerchTagPicker from "@/components/my-portfolios/MerchTagPicker"

type OpenPicker = "banner" | "background" | null

type Props = {
  editable?: boolean
  mobileCollapsed?: boolean
  mobileExpanded?: boolean
  onToggleMobile?: () => void

  backgroundIsDark?: boolean

  previousVends?: string[]
  onChangePreviousVends?: (next: string[]) => void

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
  onChangeBusinessName?: (val: string) => void

  displayName?: string
  onChangeDisplayName?: (val: string) => void

  locationText?: string
  email?: string
  onChangeLocationText?: (val: string) => void
  onChangeEmail?: (val: string) => void

  showAddLink?: boolean
  onAddLinkClick?: () => void

  linksValue?: LinkPickerValue
  onChangeLinks?: (next: LinkPickerValue) => void

  merchTags?: string[]
  onChangeMerchTags?: (next: string[]) => void
  onMerchClick?: () => void

  publishLabel?: string
  onPublish?: () => void
  onOpenPreview?: () => void

  onSocialLinkClick?: (link: {
    key?: string
    label?: string
    url?: string
  }) => void
}

const BUSINESS_PLACEHOLDER = "Business Name"
const NAME_PLACEHOLDER = "Your Name"
const LOCATION_PLACEHOLDER = "City, State"
const EMAIL_PLACEHOLDER = "myemailaddress@konfolio.com"

function safeStr(x: any) {
  return String(x ?? "").trim()
}

function normalizeUrl(raw: string): string {
  const v = safeStr(raw)
  if (!v) return ""
  const lower = v.toLowerCase()
  if (lower.startsWith("http://") || lower.startsWith("https://")) return v
  return `https://${v}`
}

function isDarkHexColor(hex: string) {
  const cleaned = safeStr(hex).replace("#", "")
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return false

  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 150
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

function IconForKey({ k, className = "w-[24px] h-[24px]" }: { k: string; className?: string }) {
  if (k === "website") return <HomeIcon className={className} />
  if (k === "shop") return <ShopIcon className={className} />
  if (k === "instagram") return <InstagramIcon className={className} />
  if (k === "x") return <XIcon className={className} />
  if (k === "facebook") return <FacebookIcon className={className} />
  if (k === "tumblr") return <TumblrIcon className={className} />
  if (k === "pixiv") return <PixivIcon className={className} />
  if (k === "bluesky") return <BlueskyIcon className={className} />
  return <HomeIcon className={className} />
}

function KonfolioLogoInline({ color = "#262626" }: { color?: string }) {
  return (
    <Link
      href="/explore"
      aria-label="Go to Explore"
      className="w-[84px] h-[18.67px] opacity-50 select-none cursor-pointer"
    >
      <div
        style={{
          fontFamily: "Inknut Antiqua",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "18.1193px",
          letterSpacing: "-0.02em",
          lineHeight: "18.67px",
          color,
          whiteSpace: "nowrap",
        }}
      >
        konfolio
      </div>
    </Link>
  )
}

function parseEventLine(line: string): { title: string; year?: string } {
  const trimmed = (line || "").trim()
  if (!trimmed) return { title: "" }

  const m = trimmed.match(/^(.*?)(?:\s*\(?(\d{4})\)?)\s*$/)
  if (!m) return { title: trimmed }

  const maybeTitle = (m[1] ?? "").trim()
  const maybeYear = m[2]

  if (maybeYear && maybeTitle.length > 0) {
    return { title: maybeTitle, year: maybeYear }
  }

  return { title: trimmed }
}

const EMPTY_PREVIOUS_VENDS: string[] = []

export default function EditPortraitProfile({
  editable = true,
  mobileCollapsed = false,
  mobileExpanded = false,
  onToggleMobile,

  backgroundIsDark,

  previousVends = EMPTY_PREVIOUS_VENDS,
  onChangePreviousVends,

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

  businessName = BUSINESS_PLACEHOLDER,
  onChangeBusinessName,

  displayName = NAME_PLACEHOLDER,
  onChangeDisplayName,

  locationText = LOCATION_PLACEHOLDER,
  email = EMAIL_PLACEHOLDER,
  onChangeLocationText,
  onChangeEmail,

  showAddLink = true,
  onAddLinkClick,

  linksValue,
  onChangeLinks,

  merchTags,
  onChangeMerchTags,
  onMerchClick,

  publishLabel = "Publish",
  onPublish,
  onOpenPreview,

  onSocialLinkClick,
}: Props) {
  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    const href = backHref || "/my-portfolios"
    const fn = (window as any).__konfolio_attempt_exit
    if (typeof fn === "function") {
      fn(href)
      return
    }
    window.location.href = href
  }

  const [localPrevVends, setLocalPrevVends] = useState<string[]>([])
  const [newVend, setNewVend] = useState("")
  const addInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const next = previousVends.slice(0, 4)
  
    setLocalPrevVends((cur) => {
      if (
        cur.length === next.length &&
        cur.every((v, i) => v === next[i])
      ) {
        return cur
      }
  
      return next
    })
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

  const [localBusiness, setLocalBusiness] = useState(businessName)
  const [localName, setLocalName] = useState(displayName)
  const [localLocation, setLocalLocation] = useState(locationText)
  const [localEmail, setLocalEmail] = useState(email)

  useEffect(() => setLocalBusiness(businessName), [businessName])
  useEffect(() => setLocalName(displayName), [displayName])
  useEffect(() => setLocalLocation(locationText), [locationText])
  useEffect(() => setLocalEmail(email), [email])

  const [localBanner, setLocalBanner] = useState(bannerColor)
  const [localBg, setLocalBg] = useState(backgroundColor)

  useEffect(() => setLocalBanner(bannerColor), [bannerColor])
  useEffect(() => setLocalBg(backgroundColor), [backgroundColor])

  const bannerIsDark = isDarkHexColor(localBanner)
  const resolvedBackgroundIsDark = backgroundIsDark ?? isDarkHexColor(localBg)
  const bannerPrimaryColor = bannerIsDark ? "#FFFFFF" : "#262626"

  const bannerPrimaryTextClass = bannerIsDark
    ? "text-white placeholder:text-white"
    : "text-[#262626] placeholder:text-[#262626]"

  const bannerPrimaryIconClass = bannerIsDark
    ? "text-white [&_path]:stroke-white"
    : "text-[#262626] [&_path]:stroke-[#262626]"

  const bannerButtonClass = bannerIsDark
    ? "border-white text-white [&_span]:text-white [&_path]:stroke-white"
    : "border-[#262626] text-[#262626] [&_span]:text-[#262626] [&_path]:stroke-[#262626]"

  const merchPickerBannerClass = bannerIsDark
    ? [
        "[&_button]:!rounded-full",
        "[&_button]:!overflow-hidden",
        "[&_button]:!border-white/30",
        "[&_button]:!bg-white/10",
        "[&_button]:!text-white",
        "[&_span]:!text-white",
        "[&_svg]:!text-white",
        "[&_path]:!stroke-white",
        "[&_path]:!fill-white",
      ].join(" ")
    : [
        "[&_button]:!rounded-full",
        "[&_button]:!overflow-hidden",
        "[&_button]:!border-[#262626]",
        "[&_button]:!bg-transparent",
        "[&_button]:!text-[#262626]",
        "[&_span]:!text-[#262626]",
        "[&_svg]:!text-[#262626]",
        "[&_path]:!stroke-[#262626]",
        "[&_path]:!fill-[#262626]",
      ].join(" ")

  const linkPickerBannerClass = bannerIsDark
    ? "[&_svg]:text-white [&_path]:stroke-white [&_path]:fill-white [&_button]:text-white [&_span]:text-white"
    : "[&_svg]:text-[#262626] [&_path]:stroke-[#262626] [&_path]:fill-[#262626] [&_button]:text-[#262626] [&_span]:text-[#262626]"

  const [localBannerSwatches, setLocalBannerSwatches] = useState<string[]>(bannerSwatches)
  const [localBgSwatches, setLocalBgSwatches] = useState<string[]>(backgroundSwatches)

  useEffect(() => setLocalBannerSwatches(bannerSwatches), [bannerSwatches])
  useEffect(() => setLocalBgSwatches(backgroundSwatches), [backgroundSwatches])

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null)
  const colorPopoverRef = useRef<HTMLDivElement | null>(null)
  const colorButtonsWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openPicker) return
    if (!editable) return

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
  }, [openPicker, editable])

  const togglePicker = (which: Exclude<OpenPicker, null>) => {
    if (!editable) return
    setOpenPicker((prev) => (prev === which ? null : which))
  }

  const pickerLabel = openPicker === "banner" ? "Banner Color" : "Background Color"
  const pickerHex = openPicker === "banner" ? localBanner : localBg
  const pickerSwatches = openPicker === "banner" ? localBannerSwatches : localBgSwatches

  const applyPickerHex = (hex: string) => {
    if (!editable) return
    if (openPicker === "banner") {
      setLocalBanner(hex)
      onChangeBannerColor?.(hex)
    } else if (openPicker === "background") {
      setLocalBg(hex)
      onChangeBackgroundColor?.(hex)
    }
  }

  const applyPickerSwatches = (next: string[]) => {
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

  const focusClearIfPlaceholder = (val: string, placeholder: string, setter: (v: string) => void) => {
    if (!editable) return
    if ((val ?? "").trim() === placeholder) setter("")
  }

  const blurRestoreIfEmpty = (
    val: string,
    placeholder: string,
    setter: (v: string) => void,
    onChange?: (v: string) => void,
  ) => {
    if (!editable) return
    if ((val ?? "").trim() !== "") return
    setter(placeholder)
    onChange?.(placeholder)
  }

  const locationMeasureRef = useRef<HTMLSpanElement | null>(null)
  const [locationPxWidth, setLocationPxWidth] = useState<number>(90)

  useLayoutEffect(() => {
    const el = locationMeasureRef.current
    if (!el) return
    const w = Math.ceil(el.getBoundingClientRect().width)
    setLocationPxWidth(Math.max(90, w + 2))
  }, [localLocation])

  const activeLinks = useMemo(() => getActiveLinkUrls(linksValue), [linksValue])

  const parsedPrevVends = useMemo(
    () => localPrevVends.map(parseEventLine),
    [localPrevVends]
  )
  
  const showPrevVendsSection = editable || localPrevVends.length > 0

  const safeTags = (Array.isArray(merchTags) ? merchTags : [])
    .map((t) => safeStr(t))
    .filter(Boolean)
    .slice(0, 8)

  const mobileProfileClass = mobileCollapsed
    ? "flex w-full flex-col px-[20px] py-[20px] text-left max-[900px]:flex min-[901px]:hidden"
    : "hidden"

  const desktopHeaderClass = mobileCollapsed
    ? "relative hidden w-full min-h-[180px] items-center justify-center overflow-visible min-[901px]:flex min-[901px]:pb-[18px] min-[1400px]:pb-0"
    : "relative hidden w-full min-h-[180px] items-center justify-center overflow-visible min-[701px]:flex min-[701px]:pb-[18px] min-[1400px]:pb-0"

  return (
    <>
      {mobileCollapsed ? (
        <section
          className="flex w-full flex-col items-center gap-[25px] px-[20px] pb-[30px] pt-[20px] text-left lg:hidden"
          style={{ backgroundColor: localBanner }}
          aria-expanded={mobileExpanded}
        >
          <div className="flex w-full items-center gap-[10px]">
            <div className="flex min-w-0 flex-1 items-center gap-[15px]">
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

              <div className="flex min-w-0 flex-1 flex-col items-start gap-[6px] py-[2px]">
                <input
                  value={localBusiness}
                  placeholder={BUSINESS_PLACEHOLDER}
                  readOnly={!editable}
                  onChange={(e) => {
                    if (!editable) return
                    setLocalBusiness(e.target.value)
                    onChangeBusinessName?.(e.target.value)
                  }}
                  className={[
                    "min-h-[24px] w-full bg-transparent text-left font-inter text-[22px] font-normal leading-[140%] placeholder:text-[#A5A5A5] outline-none",
                    bannerPrimaryTextClass,
                  ].join(" ")}
                />

                <input
                  value={localName}
                  placeholder={NAME_PLACEHOLDER}
                  readOnly={!editable}
                  onChange={(e) => {
                    if (!editable) return
                    setLocalName(e.target.value)
                    onChangeDisplayName?.(e.target.value)
                  }}
                  className="-mt-[4px] min-h-[24px] w-full bg-transparent text-left font-inter text-[15px] font-normal leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              aria-label="Open full profile"
              onClick={onToggleMobile}
              className={[
                "flex h-[32px] w-[32px] shrink-0 items-center justify-center transition-transform cursor-pointer",
                bannerPrimaryIconClass,
                mobileExpanded ? "rotate-180" : "",
              ].join(" ")}
            >
              <ArrowDown className="h-[20px] w-[20px]" />
            </button>
          </div>

          {mobileExpanded ? (
            <>
              <div className="h-px w-full bg-[#A5A5A5]/50" />

              <div className="flex w-full justify-center">
                {editable ? (
                  <LinkPicker
                    onAddLinkClick={onAddLinkClick}
                    value={linksValue}
                    onChange={onChangeLinks}
                    bannerIsDark={bannerIsDark}
                  />
                ) : (
                  <div className="flex items-center justify-center gap-[25px]">
                    {activeLinks.map((l) => (
                      <a
                        key={l.key}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          onSocialLinkClick?.({
                            key: l.key,
                            label: l.key,
                            url: l.url,
                          })
                        }
                        aria-label={iconLabelForKey(l.key)}
                        className={[
                          "flex h-[33px] w-[33px] items-center justify-center cursor-pointer",
                          bannerPrimaryIconClass,
                        ].join(" ")}
                      >
                        <IconForKey k={l.key} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px w-full bg-[#A5A5A5]/50" />

              <div className="flex w-full justify-center">
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
                  <div className="flex w-full flex-wrap justify-center gap-[7px]">
                    {safeTags.map((t) => (
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
                          className="font-inter text-[15px] font-normal leading-[140%]"
                          style={{ color: bannerPrimaryColor }}
                        >
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Previous Vends */}
              {showPrevVendsSection ? (
                <div className="flex w-full flex-col items-center gap-[10px]">
                  <p className="m-0 w-full text-center font-inter text-[14px] font-normal leading-[130%] text-[#A5A5A5]">
                    Previous Vends
                  </p>

                  <div
                    className={[
                      "w-full justify-center gap-x-[18px] gap-y-[10px]",
                      localPrevVends.length === 4
                        ? "grid grid-cols-2 justify-items-center"
                        : "flex flex-wrap items-center",
                    ].join(" ")}
                  >
                    {parsedPrevVends.map((ev, i) => (
                      <div
                        key={`${ev.title}-${ev.year ?? ""}-${i}`}
                        className="group flex items-baseline justify-center gap-[6px]"
                      >
                        <span
                          className={[
                            "text-center font-inter text-[15px] font-normal leading-[140%]",
                            bannerPrimaryTextClass,
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
                        className="w-full bg-transparent text-center font-inter text-[15px] leading-[140%] text-[#D3D3D3] placeholder:text-[#D3D3D3] outline-none"
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex w-full flex-col items-center gap-[10px]">
                <div className="flex max-w-full items-center justify-center gap-[5px] text-[#A5A5A5]">
                  <LocationIcon className="h-[12px] w-[12px] shrink-0" />

                  <input
                    value={localLocation}
                    placeholder={LOCATION_PLACEHOLDER}
                    readOnly={!editable}
                    onChange={(e) => {
                      if (!editable) return
                      setLocalLocation(e.target.value)
                      onChangeLocationText?.(e.target.value)
                    }}
                    className="min-w-0 bg-transparent text-center font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
                  />
                </div>

                <input
                  value={localEmail}
                  placeholder={EMAIL_PLACEHOLDER}
                  readOnly={!editable}
                  onChange={(e) => {
                    if (!editable) return
                    setLocalEmail(e.target.value)
                    onChangeEmail?.(e.target.value)
                  }}
                  className="w-full bg-transparent text-center font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
                />
              </div>

              {editable ? (
                <>
                  <div
                    ref={colorButtonsWrapRef}
                    className="relative flex w-full items-center justify-center -ml-[30px] gap-[8px]"
                  >
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
                      <div
                        ref={colorPopoverRef}
                        className="absolute left-1/2 top-[48px] z-[120] w-[276px] -translate-x-1/2"
                      >
                        <ColorPicker
                          label={pickerLabel}
                          valueHex={pickerHex}
                          onChangeHex={applyPickerHex}
                          swatches={pickerSwatches}
                          onChangeSwatches={applyPickerSwatches}
                          onRequestClose={() => setOpenPicker(null)}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex w-full items-center justify-center gap-[10px] pt-[4px]">
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
                </>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      <header className={desktopHeaderClass} style={{ backgroundColor: localBanner }}>
        {editable ? (
          <div className="absolute left-[8px] top-1/2 -translate-y-1/2 z-[20] hidden min-[1300px]:block min-[1200px]:left-[28px]">
            <button
              type="button"
              aria-label="Back"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleBack()
              }}
              className={`w-[30px] h-[30px] flex items-center justify-center cursor-pointer ${bannerPrimaryIconClass}`}
            >
              <ArrowLeft className="w-[30px] h-[30px]" />
            </button>
          </div>
        ) : null}

        <div className="w-full max-w-[1182px] h-[102px] flex items-center gap-[20px] px-[24px] min-[1200px]:px-0">
          <div
            className={[
              "relative w-[102px] h-[102px] min-w-[102px] shrink-0 bg-white border border-[#A5A5A5] border-[0.5px] rounded-[11.7339px] overflow-hidden",
              editable ? "cursor-pointer" : "cursor-default",
            ].join(" ")}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />

            {editable ? (
              <button
                type="button"
                className="absolute inset-0 z-[1] bg-transparent cursor-pointer"
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
            ) : (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[40px] h-[40px] text-[#A5A5A5] [&_path]:stroke-[#A5A5A5] [&_path]:fill-[#A5A5A5]">
                  <ImageIcon />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 h-[105px] flex items-center gap-[10px]">
            <div className="min-w-0 flex-1 h-[100px] flex flex-col items-start gap-[15px]">
              <div className="w-full h-[21px] flex items-center gap-[10px] pt-[5px]">
                <input
                  value={localBusiness}
                  placeholder={BUSINESS_PLACEHOLDER}
                  readOnly={!editable}
                  onFocus={() =>
                    focusClearIfPlaceholder(localBusiness, BUSINESS_PLACEHOLDER, (v) => {
                      setLocalBusiness(v)
                      onChangeBusinessName?.(v)
                    })
                  }
                  onBlur={() =>
                    blurRestoreIfEmpty(
                      localBusiness,
                      BUSINESS_PLACEHOLDER,
                      (v) => setLocalBusiness(v),
                      onChangeBusinessName,
                    )
                  }
                  onChange={(e) => {
                    if (!editable) return
                    setLocalBusiness(e.target.value)
                    onChangeBusinessName?.(e.target.value)
                  }}
                  className={`w-full font-inter font-normal text-[22px] leading-[27px] bg-transparent outline-none ${bannerPrimaryTextClass}`}
                />
              </div>

              <div className="flex items-center gap-[10px]">
                {editable ? (
                  showAddLink ? (
                    <div className={linkPickerBannerClass}>
                      <LinkPicker onAddLinkClick={onAddLinkClick} value={linksValue} onChange={onChangeLinks} />
                    </div>
                  ) : null
                ) : (
                  <div className="flex items-center gap-[10px]">
                    {activeLinks.map((l) => (
                      <a
                        key={l.key}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          onSocialLinkClick?.({
                            key: l.key,
                            label: l.key,
                            url: l.url,
                          })
                        }
                        aria-label={iconLabelForKey(l.key)}
                        className={`w-[24px] h-[24px] flex items-center justify-center cursor-pointer ${bannerPrimaryIconClass}`}
                      >
                        <IconForKey k={l.key} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full min-h-[25px] flex items-start">
                {editable ? (
                  <div className={merchPickerBannerClass}>
                    <MerchTagPicker
                      maxTags={8}
                      onMerchClick={onMerchClick}
                      layout="inlineLeft"
                      value={merchTags}
                      onChange={onChangeMerchTags}
                      isDarkBanner={bannerIsDark}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-[10px]">
                    {safeTags.map((t) => (
                      <div
                        key={t}
                        className={[
                          "flex h-[24px] items-center justify-center rounded-full border border-[0.5px] px-[20px] py-[7px]",
                          bannerIsDark ? "border-white/30" : "border-[#A5A5A5]/50",
                        ].join(" ")}
                        style={{
                          backgroundColor: bannerIsDark ? "rgba(255, 255, 255, 0.1)" : "transparent",
                        }}
                      >
                        <span
                          className="font-inter font-normal text-[15px] leading-[150%]"
                          style={{ color: bannerPrimaryColor }}
                        >
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-[260px] min-w-[260px] shrink-0 flex-col items-end gap-[15px]">
              <div className="flex h-[36px] w-full max-w-[205px] items-center justify-end gap-[16px] sm:gap-[30px]">
                {editable ? (
                  <div
                    ref={colorButtonsWrapRef}
                    className="relative w-[98px] h-[36px] flex items-center justify-end gap-[5px]"
                  >
                    <div className={`w-[16px] h-[16px] flex items-center justify-center ${bannerPrimaryIconClass}`}>
                      <BrushIcon
                        className={`h-[16px] w-[16px] ${
                          bannerIsDark
                            ? "text-white [&_path]:stroke-white [&_path]:fill-none"
                            : "text-[#262626] [&_path]:stroke-[#262626] [&_path]:fill-none"
                        }`}
                      />
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
                        className="absolute z-50 top-[52px] left-1/2 -translate-x-1/2 w-[276px]"
                      >
                        <ColorPicker
                          label={pickerLabel}
                          valueHex={pickerHex}
                          onChangeHex={applyPickerHex}
                          swatches={pickerSwatches}
                          onChangeSwatches={applyPickerSwatches}
                          onRequestClose={() => setOpenPicker(null)}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="w-[98px] h-[36px] flex items-center justify-end">
                    <KonfolioLogoInline color={bannerPrimaryColor} />
                  </div>
                )}

                {editable ? (
                  <div className="flex h-[30px] w-full max-w-[190px] items-center gap-[10px]">
                    <SecondaryButton
                      className={`h-[30px] w-full max-w-[150px] cursor-pointer bg-transparent ${bannerButtonClass}`}
                      onClick={onPublish}
                    >
                      {publishLabel}
                    </SecondaryButton>

                    <button
                      type="button"
                      aria-label="Open preview"
                      onClick={onOpenPreview}
                      className={`w-[30px] h-[30px] rounded-full border flex items-center justify-center cursor-pointer bg-transparent ${bannerButtonClass}`}
                    >
                      <OpenTabIcon className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="w-[260px] h-[54px] flex flex-col items-end justify-center gap-[4px] pt-[4px]">
                <input
                  value={localName}
                  placeholder={NAME_PLACEHOLDER}
                  readOnly={!editable}
                  onFocus={() =>
                    focusClearIfPlaceholder(localName, NAME_PLACEHOLDER, (v) => {
                      setLocalName(v)
                      onChangeDisplayName?.(v)
                    })
                  }
                  onBlur={() =>
                    blurRestoreIfEmpty(localName, NAME_PLACEHOLDER, (v) => setLocalName(v), onChangeDisplayName)
                  }
                  onChange={(e) => {
                    if (!editable) return
                    setLocalName(e.target.value)
                    onChangeDisplayName?.(e.target.value)
                  }}
                  className={`w-full text-right font-inter font-normal text-[15px] leading-[18px] bg-transparent outline-none ${bannerPrimaryTextClass}`}
                />

                <div className="w-[260px] flex justify-end relative overflow-visible">
                  <span
                    ref={locationMeasureRef}
                    className="absolute -left-[9999px] top-0 whitespace-pre font-inter font-normal text-[15px] leading-[18px]"
                  >
                    {localLocation}
                  </span>

                  <div className="flex items-center justify-end w-full">
                    <span className="inline-flex items-center mr-[5px] shrink-0 text-[#A5A5A5] [&_path]:fill-[#A5A5A5]">
                      <LocationIcon className="w-[12px] h-[12px]" />
                    </span>

                    <input
                      value={localLocation}
                      placeholder={LOCATION_PLACEHOLDER}
                      readOnly={!editable}
                      onFocus={() =>
                        focusClearIfPlaceholder(localLocation, LOCATION_PLACEHOLDER, (v) => {
                          setLocalLocation(v)
                          onChangeLocationText?.(v)
                        })
                      }
                      onBlur={() =>
                        blurRestoreIfEmpty(
                          localLocation,
                          LOCATION_PLACEHOLDER,
                          (v) => setLocalLocation(v),
                          onChangeLocationText,
                        )
                      }
                      onChange={(e) => {
                        if (!editable) return
                        setLocalLocation(e.target.value)
                        onChangeLocationText?.(e.target.value)
                      }}
                      style={{ width: `${locationPxWidth}px` }}
                      className="max-w-[238px] text-right font-inter font-normal text-[15px] leading-[18px] text-[#A5A5A5] placeholder:text-[#A5A5A5] bg-transparent outline-none"
                    />
                  </div>
                </div>

                <input
                  value={localEmail}
                  placeholder={EMAIL_PLACEHOLDER}
                  readOnly={!editable}
                  onFocus={() =>
                    focusClearIfPlaceholder(localEmail, EMAIL_PLACEHOLDER, (v) => {
                      setLocalEmail(v)
                      onChangeEmail?.(v)
                    })
                  }
                  onBlur={() =>
                    blurRestoreIfEmpty(localEmail, EMAIL_PLACEHOLDER, (v) => setLocalEmail(v), onChangeEmail)
                  }
                  onChange={(e) => {
                    if (!editable) return
                    setLocalEmail(e.target.value)
                    onChangeEmail?.(e.target.value)
                  }}
                  className="w-full text-right font-inter font-normal text-[15px] leading-[18px] text-[#A5A5A5] placeholder:text-[#A5A5A5] bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}