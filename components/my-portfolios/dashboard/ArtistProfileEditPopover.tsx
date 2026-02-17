// /components/my-portfolios/dashboard/ArtistProfileEditPopover.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import type React from "react"
import useClickOutside from "@/components/hooks/useClickOutside"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

import DeleteIcon from "@/components/icons/DeleteIcon"
import PlusIcon from "@/components/icons/PlusIcon"
import LocationIcon from "@/components/icons/LocationIcon"
import LinkIcon from "@/components/icons/LinkIcon"
import CheckIcon from "@/components/icons/CheckIcon"

import PencilIcon from "@/components/icons/PencilIcon"
import TrashIcon from "@/components/icons/TrashIcon"

import HomeIcon from "@/components/icons/HomeIcon"
import ShopIcon from "@/components/icons/ShopIcon"
import InstagramIcon from "@/components/icons/InstagramIcon"
import XIcon from "@/components/icons/XIcon"
import FacebookIcon from "@/components/icons/FacebookIcon"
import TumblrIcon from "@/components/icons/TumblrIcon"
import PixivIcon from "@/components/icons/PixivIcon"
import BlueskyIcon from "@/components/icons/BlueskyIcon"

import Tag from "@/components/onboarding/Tag"
import MerchTagPicker from "@/components/my-portfolios/MerchTagPicker"

export type ArtistProfilePopupData = {
  noticeText?: string
  profileImageUrl?: string
  businessName?: string
  locationText?: string
  firstName?: string
  lastName?: string
  preferredName?: string
  formsFilled?: number
  visitors?: number
  exploreTags?: { label: string; checked: boolean }[]
  merchTags?: string[]
  previousVends?: string[]
  betaText?: string
}

type Props = {
  open: boolean
  onClose: () => void
  data?: ArtistProfilePopupData

  onToggleExploreTag?: (label: string) => void
  onAddSalesPermit?: () => void

  onSupport?: () => void
  onReportIssue?: () => void
  onSignOut?: () => void
}

type CollabOption =
  | "Stamp Rally"
  | "Share Table"
  | "Other Collabs"
  | "Not open for collabs"

const COLLAB_OPTIONS: CollabOption[] = [
  "Stamp Rally",
  "Share Table",
  "Other Collabs",
  "Not open for collabs",
]

type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

type LinksMap = Partial<Record<SocialKey, string>>

const SOCIAL_ROWS: { key: SocialKey; label: string; Icon: React.ComponentType<any> }[] = [
  { key: "website", label: "Main Website", Icon: HomeIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "x", label: "X", Icon: XIcon },
  { key: "bluesky", label: "Bluesky", Icon: BlueskyIcon },
  { key: "shop", label: "Main Shop", Icon: ShopIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "tumblr", label: "Tumblr", Icon: TumblrIcon },
  { key: "pixiv", label: "Pixiv", Icon: PixivIcon },
]

function formatMemberSince(createdAt?: string | null) {
  if (!createdAt) return "Member since —"
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return "Member since —"

  return `Member since ${d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`
}

function splitYear(label: string) {
  const trimmed = label.trim()

  const endYear = trimmed.match(/^(.*?)(\s(19|20)\d{2})$/)
  if (endYear) return { name: endYear[1].trim(), year: endYear[2].trim(), tail: "" }

  const anyYear = trimmed.match(/(19|20)\d{2}/)
  if (anyYear) {
    const idx = trimmed.indexOf(anyYear[0])
    return {
      name: trimmed.slice(0, idx).trim(),
      year: anyYear[0],
      tail: trimmed.slice(idx + anyYear[0].length).trim(),
    }
  }

  return { name: trimmed, year: "", tail: "" }
}

function defaultExploreTags(): { label: string; checked: boolean }[] {
  return COLLAB_OPTIONS.map((label) => ({ label, checked: false }))
}

function normalizeStringArray(v: any): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
}

function isNonEmptyString(v: any): v is string {
    return typeof v === "string" && v.trim().length > 0
}  

function normalizeLinksMap(v: any): LinksMap {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {}
  const out: LinksMap = {}
  for (const row of SOCIAL_ROWS) {
    const raw = (v as any)[row.key]
    if (isNonEmptyString(raw)) out[row.key] = String(raw).trim()
  }
  return out
}

function stableJson(v: any) {
  try {
    return JSON.stringify(v ?? null)
  } catch {
    return ""
  }
}

// Enter-to-add helpers
function normalizeUrlInput(raw: string) {
  const s = raw.trim()
  if (!s) return ""
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

function inferSocialKey(url: string): SocialKey | null {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()

    if (host.includes("instagram.com")) return "instagram"
    if (host === "x.com" || host.includes("twitter.com")) return "x"
    if (host.includes("bsky.app") || host.includes("bluesky")) return "bluesky"
    if (host.includes("facebook.com")) return "facebook"
    if (host.includes("tumblr.com")) return "tumblr"
    if (host.includes("pixiv.net")) return "pixiv"

    if (
      host.includes("etsy.com") ||
      host.includes("storenvy.com") ||
      host.includes("bigcartel.com") ||
      host.includes("shopify.com")
    ) {
      return "shop"
    }

    return null
  } catch {
    return null
  }
}

function pickFallbackLinkKey(current: LinksMap): SocialKey {
  if (!current.website) return "website"
  if (!current.shop) return "shop"
  return "website"
}

export default function ArtistProfileEditPopover({
  open,
  onClose,
  data,
  onToggleExploreTag,
  onAddSalesPermit,
  onSupport,
  onReportIssue,
  onSignOut,
}: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  async function handleSignOut() {
    setSaveError("")
    try {
      await supabase.auth.signOut()
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to sign out")
      return
    }
  
    onClose()
    router.push("/")
    router.refresh()
  }
  
  useClickOutside(modalRef, () => {
    if (open) onClose()
  })

  const {
    noticeText = "Changes made here will carry onto your next uses of autofills.",
    profileImageUrl = "",
    businessName = "Business Name",
    locationText: locationTextFromProps = "City, State",
    firstName = "First",
    lastName = "Last",
    preferredName = "Preferred Name",
    formsFilled = 0,
    visitors = 0,
    exploreTags: exploreTagsProp,
    merchTags: merchTagsFromProps = [],
    previousVends: previousVendsFromProps = [],
    betaText = "Beta v.1.0",
  } = data ?? {}

  const [businessNameText, setBusinessNameText] = useState(businessName)
  const [locationText, setLocationText] = useState(locationTextFromProps)

  const [firstNameText, setFirstNameText] = useState(firstName)
  const [lastNameText, setLastNameText] = useState(lastName)
  const [preferredNameText, setPreferredNameText] = useState(preferredName)

  const [emailText, setEmailText] = useState("myemailaddress@konfolio.com")

  const [memberSince, setMemberSince] = useState("Member since —")

  const [previousVends, setPreviousVends] = useState<string[]>(previousVendsFromProps)
  const [merchTags, setMerchTags] = useState<string[]>(merchTagsFromProps)

  const [salesPermitYes, setSalesPermitYes] = useState(false)
  const [linksMap, setLinksMap] = useState<LinksMap>({})

  const [exploreTags, setExploreTags] = useState<{ label: string; checked: boolean }[]>(
    exploreTagsProp ?? defaultExploreTags(),
  )

  const [linkValue, setLinkValue] = useState("")
  const [linkFocused, setLinkFocused] = useState(false)

  const [eventValue, setEventValue] = useState("")
  const [eventFocused, setEventFocused] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const initialRef = useRef<{
    businessNameText: string
    locationText: string
    firstNameText: string
    lastNameText: string
    preferredNameText: string
    salesPermitYes: boolean
    collabs: string[]
    merchTags: string[]
    previousVends: string[]
    linksMap: LinksMap
  } | null>(null)

  const saveTimeoutRef = useRef<number | null>(null)

  useEffect(() => setBusinessNameText(businessName), [businessName])
  useEffect(() => setLocationText(locationTextFromProps), [locationTextFromProps])
  useEffect(() => setFirstNameText(firstName), [firstName])
  useEffect(() => setLastNameText(lastName), [lastName])
  useEffect(() => setPreferredNameText(preferredName), [preferredName])

  useEffect(() => setPreviousVends(previousVendsFromProps), [previousVendsFromProps])
  useEffect(() => setMerchTags(merchTagsFromProps), [merchTagsFromProps])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    setLinkValue("")
    setLinkFocused(false)
    setEventValue("")
    setEventFocused(false)

    setExploreTags(exploreTagsProp ?? defaultExploreTags())
    setMerchTags(merchTagsFromProps)

    setIsSaving(false)
    setSaveError("")
    setIsDirty(false)
    setSaveStatus("idle")
    initialRef.current = null
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)

    let cancelled = false

    async function loadProfileMeta() {
      const sessionRes = await supabase.auth.getSession()
      const userId = sessionRes.data.session?.user?.id
      const authEmail = sessionRes.data.session?.user?.email
      if (authEmail) setEmailText(authEmail)
      if (!userId) return

      const metaRes = await supabase
        .from("profiles")
        .select("location, created_at, prev_vends, collabs, merch_tags, sales_permit, links")
        .eq("id", userId)
        .maybeSingle()

      if (cancelled) return
      if (metaRes.error) {
        console.log("[ArtistProfileEditPopover] profile meta error:", metaRes.error)
        return
      }

      const row: any = metaRes.data ?? {}

      const loc = String(row.location ?? "").trim()
      if (loc) setLocationText(loc)

      setMemberSince(formatMemberSince(row.created_at ?? null))

      const nextPrev = row.prev_vends == null ? [] : normalizeStringArray(row.prev_vends)
      const nextMerch = row.merch_tags == null ? [] : normalizeStringArray(row.merch_tags)
      setPreviousVends(nextPrev)
      setMerchTags(nextMerch)

      const sp = String(row.sales_permit ?? "").trim().toLowerCase()
      const spYes = sp === "yes"
      setSalesPermitYes(spYes)

      const nextLinks = normalizeLinksMap(row.links)
      setLinksMap(nextLinks)

      let nextCollabs: string[] = []
      if (Array.isArray(row.collabs)) {
        nextCollabs = normalizeStringArray(row.collabs)
        const selected = new Set<string>(nextCollabs)
        setExploreTags(COLLAB_OPTIONS.map((label) => ({ label, checked: selected.has(label) })))
      } else {
        setExploreTags(COLLAB_OPTIONS.map((label) => ({ label, checked: false })))
      }

      const optionalRes = await supabase
        .from("profiles")
        .select("business_name, first_name, last_name, preferred_name, email")
        .eq("id", userId)
        .maybeSingle()

      let bn = businessNameText
      let fn = firstNameText
      let ln = lastNameText
      let pn = preferredNameText

      if (!cancelled && !optionalRes.error) {
        const r2: any = optionalRes.data ?? {}

        const business = String(r2.business_name ?? "").trim()
        if (business) {
          bn = business
          setBusinessNameText(business)
        }

        const f = String(r2.first_name ?? "").trim()
        if (f) {
          fn = f
          setFirstNameText(f)
        }

        const l = String(r2.last_name ?? "").trim()
        if (l) {
          ln = l
          setLastNameText(l)
        }

        const pref = String(r2.preferred_name ?? "").trim()
        if (pref) {
          pn = pref
          setPreferredNameText(pref)
        }

        const em = String(r2.email ?? "").trim()
        if (em) setEmailText(em)
      }

      initialRef.current = {
        businessNameText: String(bn ?? "").trim(),
        firstNameText: String(fn ?? "").trim(),
        lastNameText: String(ln ?? "").trim(),
        preferredNameText: String(pn ?? "").trim(),
        locationText: (loc || locationTextFromProps).trim(),
        salesPermitYes: spYes,
        collabs: nextCollabs,
        merchTags: nextMerch,
        previousVends: nextPrev,
        linksMap: nextLinks,
      }

      setIsDirty(false)
      setSaveError("")
      setSaveStatus("idle")
    }

    loadProfileMeta()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exploreTagsProp, merchTagsFromProps, locationTextFromProps])

  useEffect(() => {
    const init = initialRef.current
    if (!init) return

    const currentCollabs = exploreTags.filter((t) => t.checked).map((t) => t.label)

    const same =
      businessNameText.trim() === init.businessNameText.trim() &&
      firstNameText.trim() === init.firstNameText.trim() &&
      lastNameText.trim() === init.lastNameText.trim() &&
      preferredNameText.trim() === init.preferredNameText.trim() &&
      locationText.trim() === init.locationText.trim() &&
      salesPermitYes === init.salesPermitYes &&
      stableJson(currentCollabs) === stableJson(init.collabs) &&
      stableJson(merchTags) === stableJson(init.merchTags) &&
      stableJson(previousVends) === stableJson(init.previousVends) &&
      stableJson(linksMap) === stableJson(init.linksMap)

    setIsDirty(!same)

    if (!same && saveStatus === "saved") {
      setSaveStatus("idle")
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
    }
  }, [
    businessNameText,
    firstNameText,
    lastNameText,
    preferredNameText,
    locationText,
    salesPermitYes,
    exploreTags,
    merchTags,
    previousVends,
    linksMap,
    saveStatus,
  ])

  function toggleCollab(label: CollabOption) {
    setExploreTags((prev) => {
      const checkedSet = new Set<string>(prev.filter((t) => t.checked).map((t) => t.label))

      if (label === "Not open for collabs") {
        if (checkedSet.has(label)) checkedSet.delete(label)
        else {
          checkedSet.clear()
          checkedSet.add(label)
        }
      } else {
        checkedSet.delete("Not open for collabs")
        if (checkedSet.has(label)) checkedSet.delete(label)
        else checkedSet.add(label)
      }

      return COLLAB_OPTIONS.map((l) => ({ label: l, checked: checkedSet.has(l) }))
    })

    onToggleExploreTag?.(label)
  }

  async function handleSave() {
    setSaveError("")
    setIsSaving(true)
    setSaveStatus("saving")
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)

    try {
      const sessionRes = await supabase.auth.getSession()
      const userId = sessionRes.data.session?.user?.id
      if (!userId) throw new Error("Not signed in")

      const collabs = exploreTags.filter((t) => t.checked).map((t) => t.label)

      const payload = {
        business_name: businessNameText.trim() || null,
        first_name: firstNameText.trim() || null,
        last_name: lastNameText.trim() || null,
        preferred_name: preferredNameText.trim() || null,
        location: locationText.trim() || null,
        sales_permit: salesPermitYes ? "yes" : "no",
        collabs,
        merch_tags: merchTags,
        prev_vends: previousVends,
        links: linksMap,
      }

      const res = await supabase.from("profiles").update(payload).eq("id", userId)
      if (res.error) throw res.error

      initialRef.current = {
        businessNameText: String(payload.business_name ?? "").trim(),
        firstNameText: String(payload.first_name ?? "").trim(),
        lastNameText: String(payload.last_name ?? "").trim(),
        preferredNameText: String(payload.preferred_name ?? "").trim(),
        locationText: String(payload.location ?? "").trim(),
        salesPermitYes,
        collabs,
        merchTags,
        previousVends,
        linksMap,
      }

      setIsDirty(false)
      setSaveStatus("saved")

      saveTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus("idle")
      }, 2000)
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to save")
      setSaveStatus("idle")
    } finally {
      setIsSaving(false)
    }
  }

  function removeSalesPermit() {
    setSalesPermitYes(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/30" />

      <div
        ref={modalRef}
        className={[
          "relative bg-white rounded-[15px]",
          "shadow-[5px_5px_25px_rgba(0,0,0,0.10)]",
          "w-[995px]",
          "max-h-[calc(100vh-64px)]",
          "overflow-hidden",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          aria-label="Close popup"
          onClick={onClose}
          className="absolute right-[20px] top-[20px] w-[26px] h-[26px] flex items-center justify-center z-[5]"
        >
          <DeleteIcon className="w-[26px] h-[26px]" />
        </button>

        <div className="relative max-h-[calc(100vh-64px)] overflow-y-auto px-[130px]">
          <div className="sticky top-0 z-[2] bg-white">
            <div className="flex flex-row items-center py-[25px]">
              <p className="flex-1 text-[12px] leading-[130%] text-[#A5A5A5] whitespace-nowrap">
                {noticeText}
              </p>

              <div className="flex items-center gap-[12px]">
                {saveError ? (
                  <p className="m-0 text-[12px] leading-[130%] text-[#FF4603] whitespace-nowrap">
                    {saveError}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className={[
                    "group flex items-center justify-center gap-[7px]",
                    "h-[39px] min-w-[150px]",
                    "px-[40px] py-[13px]",
                    "rounded-[100px]",
                    "text-[14px] leading-[140%] font-normal",
                    "transition-all duration-300 ease-out",
                    "whitespace-nowrap",
                    saveStatus === "saved"
                      ? "bg-[#4CAF50] text-white opacity-100"
                      : "bg-[#262626] text-white hover:bg-[#262626CC] active:bg-[#262626B2]",
                    !isDirty && saveStatus !== "saved" ? "opacity-50 pointer-events-none" : "",
                  ].join(" ")}
                  aria-label="Save changes"
                >
                  <span>
                    {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-start gap-[29px] py-[20px]">
            <div className="w-[80px] h-[80px] rounded-[71.4286px] overflow-hidden bg-[#F7F7F7] shrink-0 relative">
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #E9E9E9 25%, transparent 25%), linear-gradient(-45deg, #E9E9E9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E9E9E9 75%), linear-gradient(-45deg, transparent 75%, #E9E9E9 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                />
              )}
            </div>

            <div className="w-[526px] flex flex-col gap-[50px]">
              <div className="w-[300px] flex flex-col gap-[15px]">
                <div className="flex flex-row items-center py-[5px] gap-[10px]">
                  <div className="flex-1">
                    <EditableInline
                      value={businessNameText}
                      placeholder="Business Name"
                      textClassName="text-[22px] leading-[140%] text-[#262626] font-normal"
                      onChange={setBusinessNameText}
                      onTrash={() => setBusinessNameText("Business Name")}
                    />
                  </div>
                </div>

                <div className="flex flex-row items-center gap-[5px] -mt-[10px]">
                  <span className="w-[12px] h-[12px] flex items-center justify-center">
                    <LocationIcon className="w-[12px] h-[12px] text-[#A5A5A5]" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <EditableInline
                      value={locationText}
                      placeholder="City, State"
                      textClassName="text-[15px] leading-[150%] text-[#262626] font-normal"
                      onChange={setLocationText}
                      onTrash={() => setLocationText("City, State")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[10px] w-full">
                <div className="flex flex-wrap items-start content-start gap-x-[15px] gap-y-[10px]">
                  <div className="w-[200px]">
                    <EditableInline
                      value={firstNameText}
                      placeholder="First"
                      textClassName="text-[15px] leading-[150%] font-normal text-[#262626]"
                      onChange={setFirstNameText}
                      onTrash={() => setFirstNameText("First")}
                    />
                  </div>

                  <div className="w-[200px]">
                    <EditableInline
                      value={lastNameText}
                      placeholder="Last"
                      textClassName="text-[15px] leading-[150%] font-normal text-[#262626]"
                      onChange={setLastNameText}
                      onTrash={() => setLastNameText("Last")}
                    />
                  </div>

                  <div className="w-[200px]">
                    <EditableInline
                      value={preferredNameText}
                      placeholder="Preferred Name"
                      textClassName="text-[15px] leading-[150%] font-normal text-[#D3D3D3]"
                      onChange={setPreferredNameText}
                      onTrash={() => setPreferredNameText("Preferred Name")}
                    />
                  </div>
                </div>

                <p className="text-[12px] italic leading-[140%] text-[#A5A5A5]">
                  “First Last” will be shown on your portfolio.
                </p>

                <div className="w-full mt-[50px]">
                  <HoverOnlyInline
                    value={emailText || "myemailaddress@konfolio.com"}
                    textClassName="text-[#262626]"
                  />
                </div>
              </div>

              <div className="flex flex-row items-start gap-[50px]">
                <CountBlock label="Forms Filled" value={formsFilled} />
                <CountBlock label="Visitors" value={visitors} />
              </div>

              <div className="flex flex-col items-start gap-[15px]">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">Explore Tags</p>

                <div className="flex flex-wrap items-start content-start gap-x-[30px] gap-y-[15px] w-full">
                  {exploreTags.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => toggleCollab(t.label as CollabOption)}
                      className="flex items-center gap-[10px] h-[13px] p-0 bg-transparent border-0 cursor-pointer"
                    >
                      <span
                        className={[
                          "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
                          t.checked ? "bg-[#262626]" : "bg-white border border-[#262626]",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {t.checked && (
                          <span
                            className="absolute"
                            style={{
                              left: "2.17px",
                              top: "3.6px",
                              transform: "scale(0.78)",
                              transformOrigin: "top left",
                            }}
                          >
                            <CheckIcon className="[&_path]:stroke-white" />
                          </span>
                        )}
                      </span>

                      <span className="text-[15px] leading-[150%] text-[#262626] text-center">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">Sales Permit</p>

                {salesPermitYes ? (
                  <div className="flex flex-row items-center gap-[10px]">
                    <div className="relative group">
                      <Tag
                        label={locationText}
                        className="h-[25px] px-[20px] py-0 text-[15px] leading-[150%] border-[#A5A5A5] bg-white/10"
                      />

                      <button
                        type="button"
                        aria-label="Remove sales permit"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeSalesPermit()
                        }}
                        className="
                          absolute
                          right-[-5.25px] top-1/2 -translate-y-1/2
                          w-[17.25px] h-[17.25px]
                          flex items-center justify-center
                          bg-[#A5A5A5]
                          rounded-full
                          opacity-0 transition-opacity
                          group-hover:opacity-100
                          z-10
                          [&_path]:stroke-[#FFFFFF]
                          [&_path]:fill-[#FFFFFF]
                        "
                      >
                        <DeleteIcon className="w-[13.42px] h-[13.42px]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label="Add sales permit"
                      onClick={onAddSalesPermit}
                      className="w-[16px] h-[16px] flex items-center justify-center"
                    >
                      <PlusIcon className="w-[16px] h-[16px] text-[#A5A5A5]" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[15px] leading-[150%] text-[#D3D3D3]">—</div>
                )}
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">My Links</p>

                <div className="flex flex-col gap-[10px] w-full">
                  {SOCIAL_ROWS.map((r) => {
                    const href = linksMap[r.key]
                    if (!isNonEmptyString(href)) return null

                    return (
                      <EditableLinkRow
                        key={r.key}
                        Icon={r.Icon}
                        value={href}
                        onChangeValue={(next) => {
                          setLinksMap((prev) => ({ ...prev, [r.key]: next }))
                        }}
                        onCommit={(finalValue) => {
                          const trimmed = finalValue.trim()
                          setLinksMap((prev) => ({ ...prev, [r.key]: trimmed }))
                        }}
                        onTrash={() => {
                          setLinksMap((prev) => {
                            const next: LinksMap = { ...prev }
                            delete (next as any)[r.key]
                            return next
                          })
                        }}
                      />
                    )
                  })}

                  <div className="flex items-center gap-[10px] w-full">
                    <LinkIcon className="w-[16px] h-[16px] text-[#D3D3D3] shrink-0" />

                    <div className="flex-1 min-w-0">
                      <input
                        value={linkValue}
                        onChange={(e) => setLinkValue(e.target.value)}
                        onFocus={() => setLinkFocused(true)}
                        onBlur={() => setLinkFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return
                          e.preventDefault()

                          const raw = linkValue.trim()
                          if (!raw) return

                          const url = normalizeUrlInput(raw)
                          const key = inferSocialKey(url)

                          setLinksMap((prev) => {
                            const chosen = key ?? pickFallbackLinkKey(prev)
                            return { ...prev, [chosen]: url }
                          })

                          setLinkValue("")
                          setLinkFocused(false)
                        }}
                        placeholder="Add Link"
                        className={[
                          "w-full bg-transparent outline-none",
                          "text-[15px] leading-[150%]",
                          linkValue ? "text-[#262626]" : "text-[#D3D3D3]",
                          "placeholder:text-[#D3D3D3]",
                          "pb-[4px]",
                        ].join(" ")}
                        aria-label="Add Link"
                      />

                      <div
                        className={[
                          "h-[1px] w-full",
                          linkFocused ? "bg-[#D3D3D3]" : "bg-transparent",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full">
                <p className="w-full text-[14px] leading-[130%] text-black">My Merchandise</p>

                <div className="w-full">
                  <MerchTagPicker
                    maxTags={8}
                    value={merchTags}
                    onChange={(next) => setMerchTags(next)}
                    layout="inlineLeft"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-[20px] w-full">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">Previous Vends</p>

                <div className="flex flex-col items-start gap-[5px] w-full">
                  {previousVends.length === 0 ? (
                    <p className="m-0 w-full font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
                      —
                    </p>
                  ) : (
                    previousVends.map((v, idx) => (
                      <EditableVendRow
                        key={`${v}-${idx}`}
                        value={v}
                        onChangeValue={(next) => {
                          setPreviousVends((prev) => {
                            const copy = [...prev]
                            copy[idx] = next
                            return copy
                          })
                        }}
                        onCommit={() => {
                          setPreviousVends((prev) =>
                            prev.map((x, i) => (i === idx ? x.trim() : x)).filter(Boolean),
                          )
                        }}
                        onTrash={() => {
                          setPreviousVends((prev) => prev.filter((_, i) => i !== idx))
                        }}
                      />
                    ))
                  )}

                    {previousVends.length < 4 ? (
                    <div className="w-full">
                        <input
                        value={eventValue}
                        onChange={(e) => setEventValue(e.target.value)}
                        onFocus={() => setEventFocused(true)}
                        onBlur={() => setEventFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return
                            e.preventDefault()

                            const next = eventValue.trim()
                            if (!next) return

                            setPreviousVends((prev) => {
                            if (prev.length >= 4) return prev
                            return [...prev, next]
                            })

                            setEventValue("")
                            setEventFocused(false)
                        }}
                        placeholder="Add Event (Event 2026)"
                        className={[
                            "w-full bg-transparent outline-none",
                            "text-[15px] leading-[150%]",
                            eventValue ? "text-[#262626]" : "text-[#D3D3D3]",
                            "placeholder:text-[#D3D3D3]",
                            "pb-[4px]",
                        ].join(" ")}
                        aria-label="Add Event"
                        />

                        <div
                        className={[
                            "h-[1px] w-full",
                            eventFocused ? "bg-[#D3D3D3]" : "bg-transparent",
                        ].join(" ")}
                        />
                    </div>
                    ) : null}

                </div>
              </div>

              <p className="text-[15px] leading-[150%] text-[#A5A5A5]">{memberSince}</p>

              <div className="flex flex-col items-start w-full">
                <AsideRow label="Support" onClick={onSupport} />
                <AsideRow label="Report issue" onClick={onReportIssue} />
                <AsideRow
                    label="Sign out"
                    danger
                    onClick={() => {
                        onSignOut?.()
                        handleSignOut()
                    }}
                />
              </div>

              <p className="text-[15px] leading-[150%] text-[#A5A5A5] pb-[40px]">{betaText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditableInline({
  value,
  placeholder,
  textClassName,
  onChange,
  onTrash,
}: {
  value: string
  placeholder: string
  textClassName: string
  onChange: (v: string) => void
  onTrash: () => void
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!editing) return
    queueMicrotask(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [editing])

  return (
    <div className="group w-full">
      <div
        className={[
          "flex items-center gap-[10px] w-full",
          editing ? "border-b border-[#D3D3D3] pb-[4px]" : "",
        ].join(" ")}
        onClick={() => setEditing(true)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault()
                  setEditing(false)
                }
              }}
              placeholder={placeholder}
              className={["w-full bg-transparent outline-none placeholder:text-[#D3D3D3]", textClassName].join(" ")}
            />
          ) : (
            <span className={["block w-full min-w-0 truncate", textClassName].join(" ")}>
              {value?.trim() ? value : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <button
            type="button"
            aria-label="Edit"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditing(true)
            }}
          >
            <PencilIcon className="w-[16px] h-[16px]" />
          </button>

          <button
            type="button"
            aria-label="Clear"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditing(false)
              onTrash()
            }}
          >
            <TrashIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function HoverOnlyInline({
  value,
  textClassName = "text-[#D3D3D3]",
}: {
  value: string
  textClassName?: string
}) {
  return (
    <div className="group w-full">
      <div className="flex items-center gap-[10px] w-full">
        <div className="flex-1 min-w-0">
          <span
            className={[
              "block w-full min-w-0 truncate text-[15px] leading-[150%] font-normal",
              textClassName,
            ].join(" ")}
          >
            {value}
          </span>
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <span className="w-[16px] h-[16px] flex items-center justify-center">
            <PencilIcon className="w-[16px] h-[16px]" />
          </span>
          <span className="w-[16px] h-[16px] flex items-center justify-center">
            <TrashIcon className="w-[16px] h-[16px]" />
          </span>
        </div>
      </div>
    </div>
  )
}

function EditableLinkRow({
  Icon,
  value,
  onChangeValue,
  onCommit,
  onTrash,
}: {
  Icon: React.ComponentType<any>
  value: string
  onChangeValue: (next: string) => void
  onCommit: (finalValue: string) => void
  onTrash: () => void
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [draft, setDraft] = useState(value)

  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (!editing) return
    queueMicrotask(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [editing])

  return (
    <div className="flex flex-row items-center gap-[10px] h-[24px] w-full group">
      <Icon className="w-[16px] h-[16px]" />

      <div
        className={[
          "flex-1 min-w-0 flex items-center gap-[10px]",
          editing ? "border-b border-[#D3D3D3] pb-[4px]" : "",
        ].join(" ")}
        onClick={() => setEditing(true)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                onChangeValue(e.target.value)
              }}
              onBlur={() => {
                setEditing(false)
                onCommit(draft)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setEditing(false)
                  onCommit(draft)
                }
                if (e.key === "Escape") {
                  e.preventDefault()
                  setEditing(false)
                }
              }}
              className="w-full bg-transparent outline-none text-[15px] leading-[150%] text-[#262626]"
              aria-label="Edit link"
            />
          ) : (
            <span className="block w-full min-w-0 text-[15px] leading-[150%] text-[#262626] truncate">
              {value}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <button
            type="button"
            aria-label="Edit"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditing(true)
            }}
          >
            <PencilIcon className="w-[16px] h-[16px]" />
          </button>

          <button
            type="button"
            aria-label="Remove"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditing(false)
              onTrash()
            }}
          >
            <TrashIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function EditableVendRow({
  value,
  onChangeValue,
  onCommit,
  onTrash,
}: {
  value: string
  onChangeValue: (next: string) => void
  onCommit: () => void
  onTrash: () => void
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!editing) return
    queueMicrotask(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [editing])

  const { name, year, tail } = splitYear(value)

  return (
    <div className="w-full group">
      <div
        className={[
          "flex items-center gap-[10px] w-full",
          editing ? "border-b border-[#D3D3D3] pb-[4px]" : "",
        ].join(" ")}
        onClick={() => setEditing(true)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChangeValue(e.target.value)}
              onBlur={() => {
                setEditing(false)
                onCommit()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setEditing(false)
                  onCommit()
                }
                if (e.key === "Escape") {
                  e.preventDefault()
                  setEditing(false)
                }
              }}
              className="w-full bg-transparent outline-none font-inter font-normal text-[15px] leading-[140%] text-[#262626]"
              aria-label="Edit event"
            />
          ) : (
            <p className="m-0 font-inter font-normal text-[15px] leading-[140%] text-[#262626] truncate">
              <span>{name}</span>
              {year ? <span className="ml-[6px] italic text-[12px] text-[#A5A5A5]">{year}</span> : null}
              {tail ? <span className="ml-[6px]">{tail}</span> : null}
            </p>
          )}
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <button
            type="button"
            aria-label="Edit"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditing(true)
            }}
          >
            <PencilIcon className="w-[16px] h-[16px]" />
          </button>

          <button
            type="button"
            aria-label="Remove"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditing(false)
              onTrash()
            }}
          >
            <TrashIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CountBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-start gap-[10px]">
      <span className="text-[15px] leading-[150%] text-[#A5A5A5]">{label}</span>
      <span className="text-[15px] leading-[150%] text-[#262626]">{value}</span>
    </div>
  )
}

function AsideRow({
  label,
  danger = false,
  onClick,
}: {
  label: string
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[526px] h-[40px] px-[10px] flex items-center rounded-[10px] hover:bg-black/5"
    >
      <span
        className={[
          "text-[14px] leading-[130%] font-normal flex items-center",
          danger ? "text-[#FF4603]" : "text-[#262626]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  )
}
