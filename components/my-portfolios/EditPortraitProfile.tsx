"use client"

import { useEffect, useRef, useState } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import ImageIcon from "@/components/icons/ImageIcon"
import BrushIcon from "@/components/icons/BrushIcon"
import LocationIcon from "@/components/icons/LocationIcon"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import SecondaryButton from "@/components/buttons/SecondaryButton"

import ColorPicker from "@/components/my-portfolios/ColorPicker"
import LinkPicker from "@/components/my-portfolios/LinkPicker"
import MerchTagPicker from "@/components/my-portfolios/MerchTagPicker"

type OpenPicker = "banner" | "background" | null

type Props = {
  backHref: string

  bannerColor?: string
  backgroundColor?: string
  onChangeBannerColor?: (hex: string) => void
  onChangeBackgroundColor?: (hex: string) => void

  profileImageUrl?: string
  onChangeProfileImage?: (file: File, objectUrl: string) => void

  businessName?: string
  onChangeBusinessName?: (val: string) => void

  displayName?: string
  onChangeDisplayName?: (val: string) => void

  // ✅ include these because your page passes them
  locationText?: string
  email?: string
  onChangeLocationText?: (val: string) => void
  onChangeEmail?: (val: string) => void

  // ✅ include these because your page passes them
  showAddLink?: boolean
  onAddLinkClick?: () => void

  onMerchClick?: () => void

  publishLabel?: string
  onPublish?: () => void
  onOpenPreview?: () => void
}

export default function EditPortraitProfile({
  backHref,

  bannerColor = "#FFFFFF",
  backgroundColor = "#F7F7F7",
  onChangeBannerColor,
  onChangeBackgroundColor,

  profileImageUrl,
  onChangeProfileImage,

  businessName = "Business Name",
  onChangeBusinessName,

  displayName = "Your Name",
  onChangeDisplayName,

  locationText = "City, State",
  email = "myemailaddress@konfolio.com",
  onChangeLocationText,
  onChangeEmail,

  showAddLink = false,
  onAddLinkClick,

  onMerchClick,

  publishLabel = "Publish",
  onPublish,
  onOpenPreview,
}: Props) {
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

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null)
  const openPickerRef = useRef<OpenPicker>(null)
  useEffect(() => {
    openPickerRef.current = openPicker
  }, [openPicker])

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

  const applyPickerHex = (hex: string) => {
    const which = openPickerRef.current
    if (which === "banner") {
      setLocalBanner(hex)
      onChangeBannerColor?.(hex)
    } else if (which === "background") {
      setLocalBg(hex)
      onChangeBackgroundColor?.(hex)
    }
  }

  // profile image upload (102x102)
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

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    setLocalImgUrl(url)
    onChangeProfileImage?.(file, url)
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFile(file)
    e.target.value = ""
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    handleFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <header className="relative w-[1512px] h-[147px] bg-white flex items-center justify-center">
      <div className="absolute left-[105px] top-1/2 -translate-y-1/2 z-[2]">
        <ArrowLeft href={backHref} className="w-[30px] h-[30px]" />
      </div>

      <div className="w-[1182px] h-[102px] flex items-center gap-[20px]">
        <div
          className="relative w-[102px] h-[102px] bg-white border border-[#A5A5A5] border-[0.5px] rounded-[11.7339px] overflow-hidden"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />

          <button
            type="button"
            className="absolute inset-0 z-[1] bg-transparent"
            aria-label="Upload profile image"
            onClick={openFilePicker}
          >
            <span className="sr-only">Upload</span>
          </button>

          {localImgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
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

        <div className="w-[1060px] h-[105px] flex items-center gap-[10px]">
          <div className="w-[830px] h-[100px] flex flex-col items-start gap-[15px]">
            <div className="w-full h-[21px] flex items-center gap-[10px] pt-[5px]">
              <input
                value={localBusiness}
                onChange={(e) => {
                  setLocalBusiness(e.target.value)
                  onChangeBusinessName?.(e.target.value)
                }}
                placeholder="Business Name"
                className="w-full font-inter font-normal text-[22px] leading-[27px] text-[#A5A5A5] placeholder:text-[#A5A5A5] bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-[10px]">
              <LinkPicker onAddLinkClick={showAddLink ? onAddLinkClick : undefined} />
            </div>

            <div className="w-full min-h-[25px] flex flex-wrap items-start gap-[10px]">
              <MerchTagPicker maxTags={8} onMerchClick={onMerchClick} />
            </div>
          </div>

          <div className="w-[220px] h-[105px] flex flex-col items-end gap-[15px]">
            <div className="w-[205px] h-[36px] flex items-center justify-end gap-[30px]">
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
                  className="w-[36px] h-[36px] border border-[rgba(165,165,165,0.5)] bg-white relative overflow-hidden"
                >
                  <span className="absolute inset-0" style={{ backgroundColor: localBanner }} />
                </button>

                <button
                  type="button"
                  onClick={() => togglePicker("background")}
                  aria-label="Pick background color"
                  className="w-[36px] h-[36px] border border-[rgba(165,165,165,0.5)] bg-white relative overflow-hidden"
                >
                  <span className="absolute inset-0" style={{ backgroundColor: localBg }} />
                </button>

                {openPicker ? (
                  <div ref={colorPopoverRef} className="absolute z-50 top-[44px] left-1/2 -translate-x-1/2 w-[276px]">
                    <ColorPicker
                      label={pickerLabel}
                      initialHex={pickerHex}
                      onChange={applyPickerHex}
                      onRequestClose={() => setOpenPicker(null)}
                    />
                  </div>
                ) : null}
              </div>

              <div className="w-[190px] h-[30px] flex items-center gap-[10px]">
                <SecondaryButton className="w-[150px] h-[30px]" onClick={onPublish}>
                  {publishLabel}
                </SecondaryButton>

                <button
                  type="button"
                  aria-label="Open preview"
                  onClick={onOpenPreview}
                  className="w-[30px] h-[30px] rounded-full border border-[#262626] flex items-center justify-center"
                >
                  <OpenTabIcon className="w-[16px] h-[16px]" />
                </button>
              </div>
            </div>

            <div className="w-[220px] h-[54px] flex flex-col items-end justify-center gap-[10px]">
              <input
                value={localName}
                onChange={(e) => {
                  setLocalName(e.target.value)
                  onChangeDisplayName?.(e.target.value)
                }}
                className="w-full text-right font-inter font-normal text-[15px] leading-[18px] text-black bg-transparent outline-none"
              />

              <div className="w-[220px] flex items-center justify-end gap-[5px]">
                <div className="w-[12px] h-[12px] flex items-center justify-center text-[#A5A5A5] [&_path]:fill-[#A5A5A5]">
                  <LocationIcon className="w-[12px] h-[12px]" />
                </div>
                <input
                  value={localLocation}
                  onChange={(e) => {
                    setLocalLocation(e.target.value)
                    onChangeLocationText?.(e.target.value)
                  }}
                  className="w-auto text-center font-inter font-normal text-[15px] leading-[18px] text-[#A5A5A5] bg-transparent outline-none"
                />
              </div>

              <input
                value={localEmail}
                onChange={(e) => {
                  setLocalEmail(e.target.value)
                  onChangeEmail?.(e.target.value)
                }}
                className="w-full text-center font-inter font-normal text-[15px] leading-[18px] text-[#A5A5A5] bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
