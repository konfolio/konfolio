"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import SecondaryButton from "@/components/buttons/SecondaryButton"
import PencilIcon from "@/components/icons/PencilIcon"
import { supabase } from "@/lib/supabase/browser"

import ArtistProfileEditPopover, {
  type ArtistProfilePopupData,
} from "@/components/my-portfolios/dashboard/ArtistProfileEditPopover"

type Profile = {
  first_name: string | null
  last_name: string | null
  preferred_name: string | null
  business_name: string | null
  profile_image_url: string | null
}

type Props = {
  profileImageUrl?: string
  businessName?: string
  displayNameLine?: string
  konfolioCount?: number

  editHref?: string
  createHref?: string
  className?: string

  onClickCreate?: () => void
}

const MAX_PUBLISHED_KONFOLIOS = 3

function pad2(n: number) {
  const s = String(Math.max(0, Math.floor(n)))
  return s.length >= 2 ? s : `0${s}`
}

function fullNameFromProfile(p: Profile | null) {
  const first = (p?.first_name || "").trim()
  const last = (p?.last_name || "").trim()
  return [first, last].filter(Boolean).join(" ").trim()
}

export default function DashboardProfileHeader({
  profileImageUrl: profileImageUrlOverride,
  businessName: businessNameOverride,
  displayNameLine: displayNameLineOverride,
  konfolioCount: konfolioCountOverride,

  editHref = "/profile",
  createHref = "/create",
  className = "",

  onClickCreate,
}: Props) {
  const [signedIn, setSignedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [publishedCount, setPublishedCount] = useState(0)

  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)
  const [limitOpen, setLimitOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data.session?.user

      if (!mounted) return

      if (!user) {
        setSignedIn(false)
        setProfile(null)
        setPublishedCount(0)
        return
      }

      setSignedIn(true)

      const profileRes = await supabase
        .from("profiles")
        .select("first_name,last_name,preferred_name,business_name,profile_image_url")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return

      if (profileRes.error) {
        console.log("[DashboardProfileHeader] profile error:", profileRes.error)
        setProfile(null)
      } else {
        setProfile((profileRes.data as Profile | null) ?? null)
      }

      const countRes = await supabase
        .from("konfolios")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "published")

      if (!mounted) return

      if (countRes.error) {
        console.log("[DashboardProfileHeader] konfolio count error:", countRes.error)
        setPublishedCount(0)
      } else {
        setPublishedCount(countRes.count ?? 0)
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  function handleProfileSaved(patch: Profile) {
    setProfile((prev) => {
      const base =
        prev ??
        ({
          first_name: null,
          last_name: null,
          preferred_name: null,
          business_name: null,
          profile_image_url: null,
        } as Profile)

      return {
        first_name: patch.first_name ?? base.first_name ?? null,
        last_name: patch.last_name ?? base.last_name ?? null,
        preferred_name: patch.preferred_name ?? base.preferred_name ?? null,
        business_name: patch.business_name ?? base.business_name ?? null,
        profile_image_url: patch.profile_image_url ?? base.profile_image_url ?? null,
      }
    })
  }

  const fullName = useMemo(() => fullNameFromProfile(profile), [profile])

  const resolvedProfileImageUrl =
    (profileImageUrlOverride ?? profile?.profile_image_url) || ""

  const resolvedBusinessName =
    (businessNameOverride?.trim() || "") ||
    (profile?.business_name || "").trim() ||
    fullName ||
    "Business Name"

  const resolvedDisplayNameLine =
    (displayNameLineOverride?.trim() || "") ||
    (() => {
      const preferred = (profile?.preferred_name || "").trim()
      if (preferred) return preferred
      return fullName
    })()

  const resolvedCount = konfolioCountOverride ?? publishedCount
  const showChecker = !resolvedProfileImageUrl

  const limitReached = resolvedCount >= MAX_PUBLISHED_KONFOLIOS
  const createBlocked = signedIn && limitReached

  const popoverData: ArtistProfilePopupData = useMemo(
    () => ({
      profileImageUrl: resolvedProfileImageUrl,
      businessName: resolvedBusinessName,
      locationText: "City, State",
      firstName: (profile?.first_name || "").trim() || "First",
      lastName: (profile?.last_name || "").trim() || "Last",
      preferredName: (profile?.preferred_name || "").trim() || "Preferred Name",

      formsFilled: 0,
      visitors: 0,

      links: {},

      merchTags: [],
      previousVends: [],
      salesPermits: [],
    }),
    [
      resolvedProfileImageUrl,
      resolvedBusinessName,
      profile?.first_name,
      profile?.last_name,
      profile?.preferred_name,
    ]
  )

  return (
    <>
      <section
        className={[
          "w-full bg-white",
          "flex flex-col items-center",
          "pb-[25px]",
          className,
        ].join(" ")}
      >
        <div className="w-full flex items-center justify-center px-4 sm:px-8 lg:px-[150px] pt-[15px]">
          <div className="w-full max-w-[1212px] flex flex-col sm:flex-row sm:items-end justify-between gap-[24px] sm:gap-[15px]">
            <div className="flex items-center gap-[16px] sm:gap-[19px] min-h-[80px] flex-1 min-w-0">
              <div className="relative w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-full overflow-hidden bg-[#F7F7F7] shrink-0">
                {!showChecker ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvedProfileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
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

              <div className="flex flex-col items-start py-[5px] flex-1 min-w-0">
                <div className="flex flex-col items-start gap-[4px] w-full">
                  <div className="text-[18px] sm:text-[20px] leading-[140%] font-normal text-[#262626] truncate">
                    {resolvedBusinessName}
                  </div>

                  {resolvedDisplayNameLine ? (
                    <div className="text-[14px] leading-[18px] font-normal text-[#A5A5A5] truncate">
                      {resolvedDisplayNameLine}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setProfilePopoverOpen(true)}
                  className="mt-[15px] inline-flex items-center gap-[4px] h-[16px] rounded-full hover:opacity-80 active:opacity-70 cursor-pointer"
                >
                  <PencilIcon className="w-[16px] h-[16px]" />
                  <span className="text-[12px] leading-[130%] font-normal text-[#262626]">
                    Edit Profile
                  </span>
                </button>

                <Link href={editHref} className="hidden">
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-[14px] w-full sm:w-[150px] shrink-0">
              <div className="text-left sm:text-right text-[14px] leading-[130%] font-normal text-[#A5A5A5]">
                {pad2(resolvedCount)} konfolios
              </div>

              <SecondaryButton
                onClick={() => {
                  if (!signedIn) return
                  if (createBlocked) {
                    setLimitOpen(true)
                    return
                  }
                  onClickCreate?.()
                }}
                className={[
                  "w-[150px] min-w-[150px] h-[30px] px-[40px] py-[10px] gap-[7px]",
                  createBlocked ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                disabled={!signedIn}
                aria-disabled={createBlocked}
              >
                <span className="inline-flex items-center gap-[7px]">
                  <span className="text-[14px] leading-[14px] font-normal">+</span>
                  <span>Create</span>
                </span>
              </SecondaryButton>

              <Link href={createHref} className="hidden">
                Create
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ArtistProfileEditPopover
        open={profilePopoverOpen}
        onClose={() => setProfilePopoverOpen(false)}
        data={popoverData}
        onSaved={handleProfileSaved}
      />

      <KonfolioLimitModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        max={MAX_PUBLISHED_KONFOLIOS}
        count={resolvedCount}
      />
    </>
  )
}

function KonfolioLimitModal({
  open,
  onClose,
  max,
  count,
}: {
  open: boolean
  onClose: () => void
  max: number
  count: number
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-[420px] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="text-[18px] font-semibold text-[#262626]">
          Konfolio limit reached
        </div>

        <div className="mt-2 text-[14px] leading-[140%] text-[#6B6B6B]">
          You can have up to {max} published konfolios. You currently have{" "}
          {count}.
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-[999px] bg-[#262626] px-4 text-[14px] text-white cursor-pointer"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}