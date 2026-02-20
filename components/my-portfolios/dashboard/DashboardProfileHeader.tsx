"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import SecondaryButton from "@/components/buttons/SecondaryButton"
import PencilIcon from "@/components/icons/PencilIcon"
import { supabase } from "@/lib/supabase/browser"

import ArtistProfileEditPopover, {
  type ArtistProfilePopupData,
} from "@/components/my-portfolios/dashboard/ArtistProfileEditPopover"

import CreateKonfolioPopover from "@/components/my-portfolios/dashboard/CreateKonfolioPopover"

type Profile = {
  first_name: string | null
  last_name: string | null
  preferred_name: string | null
  business_name: string | null
  profile_image_url: string | null
}

type Props = {
  // Optional overrides
  profileImageUrl?: string
  businessName?: string
  displayNameLine?: string
  konfolioCount?: number

  editHref?: string
  createHref?: string
  className?: string
}

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
}: Props) {
  const router = useRouter()

  const [signedIn, setSignedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  // popovers
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)
  const [createPopoverOpen, setCreatePopoverOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data.session?.user

      if (!mounted) return

      if (!user) {
        setSignedIn(false)
        setProfile(null)
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
        return
      }

      setProfile((profileRes.data as Profile | null) ?? null)
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

  const resolvedCount = konfolioCountOverride ?? 0 // keep as-is for now
  const showChecker = !resolvedProfileImageUrl

  // popover data
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

      // show none by default (only show icons when link exists)
      links: {},

      // empty by default for now
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
    ],
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
        <div className="w-full flex items-center justify-center px-[150px] pt-[15px]">
          <div className="w-full max-w-[1212px] h-[80px] flex items-end justify-between gap-[15px]">
            {/* Profile */}
            <div className="flex items-center gap-[19px] h-[80px] flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative w-[80px] h-[80px] rounded-[71.4286px] overflow-hidden bg-[#F7F7F7] shrink-0">
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

              {/* Info */}
              <div className="flex flex-col items-start py-[5px] h-[80px] flex-1 min-w-0">
                {/* less gap between business name and name */}
                <div className="flex flex-col items-start gap-[4px] w-full">
                  <div className="text-[20px] leading-[28px] font-normal text-[#262626] truncate">
                    {resolvedBusinessName}
                  </div>

                  {resolvedDisplayNameLine ? (
                    <div className="text-[14px] leading-[18px] font-normal text-[#A5A5A5] truncate">
                      {resolvedDisplayNameLine}
                    </div>
                  ) : null}
                </div>

                {/* bigger gap between name and edit profile */}
                <button
                  type="button"
                  onClick={() => setProfilePopoverOpen(true)}
                  className="mt-[15px] inline-flex items-center gap-[4px] h-[16px] rounded-full hover:opacity-80 active:opacity-70"
                >
                  <PencilIcon className="w-[16px] h-[16px]" />
                  <span className="text-[12px] leading-[130%] font-normal text-[#262626]">
                    Edit Profile
                  </span>
                </button>

                {/* keep route if you still need it */}
                <Link href={editHref} className="hidden">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Create Field */}
            <div className="flex flex-col items-end gap-[14px] w-[150px] h-[54px] shrink-0">
              <div className="text-right text-[14px] leading-[130%] font-normal text-[#A5A5A5] w-full">
                {pad2(resolvedCount)} konfolios
              </div>

              <SecondaryButton
                onClick={() => {
                  if (!signedIn) return
                  setCreatePopoverOpen(true)
                }}
                className="w-[150px] min-w-[150px] h-[30px] px-[40px] py-[10px] gap-[7px]"
                disabled={!signedIn}
              >
                <span className="inline-flex items-center gap-[7px]">
                  <span className="text-[14px] leading-[14px] font-normal">+</span>
                  <span>Create</span>
                </span>
              </SecondaryButton>

              {/* fallback route (hidden) */}
              <Link href={createHref} className="hidden">
                Create
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Popover */}
      <ArtistProfileEditPopover
        open={profilePopoverOpen}
        onClose={() => setProfilePopoverOpen(false)}
        data={popoverData}
      />

      {/* Create Popover */}
      <CreateKonfolioPopover
        open={createPopoverOpen}
        onClose={() => setCreatePopoverOpen(false)}
        onPickTemplate={() => {
          // Optional callback only. Do NOT route.
          setCreatePopoverOpen(false)
        }}
      />
    </>
  )
}
