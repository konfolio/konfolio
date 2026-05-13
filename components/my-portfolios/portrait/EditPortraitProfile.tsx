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

function KonfolioLogoInline() {
  return (
    <div
      aria-label="Konfolio"
      className="w-[84px] h-[18.67px] opacity-50 pointer-events-none select-none"
    >
      <div
        style={{
          fontFamily: "Inknut Antiqua",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "18.1193px",
          letterSpacing: "-0.02em",
          lineHeight: "18.67px",
          color: "#262626",
          whiteSpace: "nowrap",
        }}
      >
        konfolio
      </div>
    </div>
  )
}

export default function EditPortraitProfile({
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
    onChange?: (v: string) => void
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
  const safeTags = (Array.isArray(merchTags) ? merchTags : [])
    .map((t) => safeStr(t))
    .filter(Boolean)
    .slice(0, 8)

  return (
    <>
      {mobileCollapsed ? (
        <section
          className="flex w-full flex-col px-[20px] py-[20px] text-left max-[900px]:flex min-[901px]:hidden"
          style={{ backgroundColor: localBanner }}
          aria-expanded={mobileExpanded}
        >
          <div className="flex w-full items-center justify-between gap-[15px]">
            <div className="flex min-w-0 items-center gap-[15px]">
              <button
                type="button"
                aria-label="Upload profile image"
                onClick={openFilePicker}
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
                  blurRestoreIfEmpty(localBusiness, BUSINESS_PLACEHOLDER, (v) => setLocalBusiness(v), onChangeBusinessName)
                }
                onChange={(e) => {
                  if (!editable) return
                  setLocalBusiness(e.target.value)
                  onChangeBusinessName?.(e.target.value)
                }}
                className="min-w-0 flex-1 bg-transparent text-left font-inter text-[22px] font-normal leading-[140%] text-[#262626] placeholder:text-[#A5A5A5] outline-none"
              />
            </div>

            <button
              type="button"
              aria-label="Open full profile editor"
              onClick={onToggleMobile}
              className={[
                "flex h-[32px] w-[32px] shrink-0 items-center justify-center text-[#262626] transition-transform cursor-pointer",
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
                  <BrushIcon className="h-[16px] w-[16px]" />

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
                        onChangeHex={applyPickerHex}
                        swatches={pickerSwatches}
                        onChangeSwatches={applyPickerSwatches}
                        onRequestClose={() => setOpenPicker(null)}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

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
                onBlur={() => blurRestoreIfEmpty(localName, NAME_PLACEHOLDER, (v) => setLocalName(v), onChangeDisplayName)}
                onChange={(e) => {
                  if (!editable) return
                  setLocalName(e.target.value)
                  onChangeDisplayName?.(e.target.value)
                }}
                className="w-full bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
              />

              <div className="flex w-full items-center gap-[5px] text-[#A5A5A5]">
                <LocationIcon className="h-[12px] w-[12px] shrink-0" />
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
                    blurRestoreIfEmpty(localLocation, LOCATION_PLACEHOLDER, (v) => setLocalLocation(v), onChangeLocationText)
                  }
                  onChange={(e) => {
                    if (!editable) return
                    setLocalLocation(e.target.value)
                    onChangeLocationText?.(e.target.value)
                  }}
                  className="min-w-0 flex-1 bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
                />
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
                onBlur={() => blurRestoreIfEmpty(localEmail, EMAIL_PLACEHOLDER, (v) => setLocalEmail(v), onChangeEmail)}
                onChange={(e) => {
                  if (!editable) return
                  setLocalEmail(e.target.value)
                  onChangeEmail?.(e.target.value)
                }}
                className="w-full bg-transparent text-left font-inter text-[15px] leading-[140%] text-[#A5A5A5] placeholder:text-[#A5A5A5] outline-none"
              />

              <div className="flex w-full justify-start">
                {editable ? (
                  showAddLink ? (
                    <LinkPicker onAddLinkClick={onAddLinkClick} value={linksValue} onChange={onChangeLinks} />
                  ) : null
                ) : (
                  <div className="flex items-center justify-start gap-[10px]">
                    {activeLinks.map((l) => (
                      <a
                        key={l.key}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={iconLabelForKey(l.key)}
                        className="w-[24px] h-[24px] flex items-center justify-center text-[#262626] cursor-pointer"
                      >
                        <IconForKey k={l.key} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex w-full justify-start">
                {editable ? (
                  <MerchTagPicker
                    maxTags={8}
                    onMerchClick={onMerchClick}
                    layout="inlineLeft"
                    value={merchTags}
                    onChange={onChangeMerchTags}
                  />
                ) : (
                  <div className="flex flex-wrap justify-start gap-[10px]">
                    {safeTags.map((t) => (
                      <div
                        key={t}
                        className="flex items-center justify-center px-[20px] py-[7px] h-[24px] rounded-full border border-[#A5A5A5] border-[0.5px]"
                      >
                        <span className="font-inter font-normal text-[15px] leading-[150%] text-[#262626]">
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {editable ? (
                <div className="flex w-full items-center justify-start gap-[10px] pt-[4px]">
                  <SecondaryButton onClick={onPublish}>{publishLabel}</SecondaryButton>

                  <button
                    type="button"
                    aria-label="Open preview"
                    onClick={onOpenPreview}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#262626] cursor-pointer"
                  >
                    <OpenTabIcon className="h-[16px] w-[16px] [&_path]:stroke-[#262626]" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <header
        className="relative hidden w-full h-[180px] items-center justify-center overflow-visible min-[901px]:flex"
        style={{ backgroundColor: localBanner }}
      >
        {editable ? (
          <div className="absolute left-[12px] top-1/2 -translate-y-1/2 z-[20] xl:left-[45px] 2xl:left-[105px]">
            <button
              type="button"
              aria-label="Back"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleBack()
              }}
              className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-[30px] h-[30px]" />
            </button>
          </div>
        ) : null}

        <div className="w-full max-w-[1182px] h-[102px] flex items-center gap-[20px] pl-[75px] pr-[24px] xl:pl-0 xl:pr-0">
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
                    blurRestoreIfEmpty(localBusiness, BUSINESS_PLACEHOLDER, (v) => setLocalBusiness(v), onChangeBusinessName)
                  }
                  onChange={(e) => {
                    if (!editable) return
                    setLocalBusiness(e.target.value)
                    onChangeBusinessName?.(e.target.value)
                  }}
                  className={[
                    "w-full font-inter font-normal text-[22px] leading-[27px] bg-transparent outline-none",
                    editable ? "text-[#A5A5A5] placeholder:text-[#A5A5A5]" : "text-[#262626] placeholder:text-[#262626]",
                  ].join(" ")}
                />
              </div>

              <div className="flex items-center gap-[10px]">
                {editable ? (
                  showAddLink ? (
                    <LinkPicker onAddLinkClick={onAddLinkClick} value={linksValue} onChange={onChangeLinks} />
                  ) : null
                ) : (
                  <div className="flex items-center gap-[10px]">
                    {activeLinks.map((l) => (
                      <a
                        key={l.key}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={iconLabelForKey(l.key)}
                        className="w-[24px] h-[24px] flex items-center justify-center text-[#262626] cursor-pointer"
                      >
                        <IconForKey k={l.key} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full min-h-[25px] flex items-start">
                {editable ? (
                  <MerchTagPicker
                    maxTags={8}
                    onMerchClick={onMerchClick}
                    layout="inlineLeft"
                    value={merchTags}
                    onChange={onChangeMerchTags}
                  />
                ) : (
                  <div className="flex flex-wrap gap-[10px]">
                    {safeTags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="flex items-center justify-center px-[20px] py-[7px] h-[24px] rounded-full border border-[#A5A5A5] border-[0.5px]"
                        onClick={() => {}}
                      >
                        <span className="font-inter font-normal text-[15px] leading-[150%] text-[#262626]">
                          {t}
                        </span>
                      </button>
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
                    <div className="w-[16px] h-[16px] flex items-center justify-center text-[#A5A5A5]">
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
                    <KonfolioLogoInline />
                  </div>
                )}

                {editable ? (
                  <div className="flex h-[30px] w-full max-w-[190px] items-center gap-[10px]">
                    <SecondaryButton className="h-[30px] w-full max-w-[150px] cursor-pointer" onClick={onPublish}>
                      {publishLabel}
                    </SecondaryButton>

                    <button
                      type="button"
                      aria-label="Open preview"
                      onClick={onOpenPreview}
                      className="w-[30px] h-[30px] rounded-full border border-[#262626] flex items-center justify-center cursor-pointer"
                    >
                      <OpenTabIcon className="w-[16px] h-[16px] [&_path]:stroke-[#262626]" />
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
                  onBlur={() => blurRestoreIfEmpty(localName, NAME_PLACEHOLDER, (v) => setLocalName(v), onChangeDisplayName)}
                  onChange={(e) => {
                    if (!editable) return
                    setLocalName(e.target.value)
                    onChangeDisplayName?.(e.target.value)
                  }}
                  className="w-full text-right font-inter font-normal text-[15px] leading-[18px] text-black placeholder:text-black bg-transparent outline-none"
                />

                <div className="w-[260px] flex justify-end relative overflow-visible">
                  <span
                    ref={locationMeasureRef}
                    className="absolute -left-[9999px] top-0 whitespace-pre font-inter font-normal text-[15px] leading-[18px]"
                  >
                    {localLocation}
                  </span>

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
                            onChangeLocationText
                          )
                        }
                        onChange={(e) => {
                          if (!editable) return
                          setLocalLocation(e.target.value)
                          onChangeLocationText?.(e.target.value)
                        }}
                        className="text-right font-inter font-normal text-[15px] leading-[18px] text-[#A5A5A5] placeholder:text-[#A5A5A5] bg-transparent outline-none"
                      />
                    </div>
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
                  onBlur={() => blurRestoreIfEmpty(localEmail, EMAIL_PLACEHOLDER, (v) => setLocalEmail(v), onChangeEmail)}
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