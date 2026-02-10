"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { inknut } from "@/app/fonts"
import { supabase } from "@/lib/supabaseClient"

type Profile = {
  first_name: string | null
  preferred_name: string | null
  profile_image_url: string | null
}

function normalizePath(pathnameRaw: string) {
  return pathnameRaw.endsWith("/") && pathnameRaw !== "/"
    ? pathnameRaw.slice(0, -1)
    : pathnameRaw
}

function NavItem({
  href,
  label,
  active,
  widthClass,
}: {
  href: string
  label: string
  active: boolean
  widthClass: string
}) {
  return (
    <Link
      href={href}
      className={`hidden lg:flex flex-col items-start pt-[6px] gap-[6px] ${widthClass} h-[24px]`}
    >
      <span
        className={`
          ${widthClass}
          h-[12px]
          flex items-center justify-center
          text-[17px]
          leading-[21px]
          text-[#262626]
          whitespace-nowrap
          ${active ? "font-semibold" : "font-normal hover:font-semibold"}
        `}
      >
        {label}
      </span>

      <span
        className={`
          ${widthClass}
          h-0
          border border-[#262626]
          self-stretch
          ${active ? "opacity-100" : "opacity-0"}
        `}
      />
    </Link>
  )
}

export default function Navbar() {
  const router = useRouter()
  const pathnameRaw = usePathname() || ""
  const pathname = normalizePath(pathnameRaw)

  const [signedIn, setSignedIn] = useState(false)
  const [displayName, setDisplayName] = useState<string>("")
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  const isExploreActive = pathname === "/explore" || pathname.startsWith("/explore/")
  const isPortfoliosActive =
    pathname === "/my-portfolios" || pathname.startsWith("/my-portfolios/")
  const isSupportActive = pathname === "/support" || pathname.startsWith("/support/")

  const hideAccountOnMyPortfolios = pathname === "/my-portfolios"

  // Pull session + profile (and keep in sync with auth events)
  useEffect(() => {
    let mounted = true

    async function load() {
      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data.session?.user

      if (!mounted) return

      if (!user) {
        setSignedIn(false)
        setDisplayName("")
        setProfileImageUrl(null)
        return
      }

      setSignedIn(true)

      const profileRes = await supabase
        .from("profiles")
        .select("first_name, preferred_name, profile_image_url")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return

      if (profileRes.error) {
        // If profile is blocked/missing, still consider the user signed in,
        // but fall back to initials.
        setDisplayName("")
        setProfileImageUrl(null)
        return
      }

      const p = profileRes.data as Profile | null
      const preferred = (p?.preferred_name || "").trim()
      const first = (p?.first_name || "").trim()

      setDisplayName(preferred || first)
      setProfileImageUrl(p?.profile_image_url ?? null)
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      load()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const initials = useMemo(() => {
    const c = displayName?.[0]?.toUpperCase()
    return c && c.length ? c : "U"
  }, [displayName])

  return (
    <nav className="w-full h-[61px] bg-white">
      <div className="h-full px-[25px] sm:px-10 lg:px-[150px] pt-[15px] pb-[10px] flex items-center">
        <div className="w-full max-w-[1212px] h-[36px] mx-auto flex items-center justify-between">
          {/* LEFT GROUP */}
          <div className="flex items-center gap-[18px] lg:gap-[50px]">
            <Link href="/" className="flex items-center">
              <span
                className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold text-[#262626]`}
              >
                konfolio
              </span>
            </Link>

            {/* Desktop nav items */}
            {signedIn ? (
              <>
                <NavItem
                  href="/my-portfolios"
                  label="My Portfolios"
                  active={isPortfoliosActive}
                  widthClass="w-[110px]"
                />
                <NavItem
                  href="/explore"
                  label="Explore"
                  active={isExploreActive}
                  widthClass="w-[60px]"
                />
                <NavItem
                  href="/support"
                  label="Support"
                  active={isSupportActive}
                  widthClass="w-[65px]"
                />
              </>
            ) : (
              <NavItem
                href="/explore"
                label="Explore"
                active={isExploreActive}
                widthClass="w-[62px]"
              />
            )}
          </div>

          {/* RIGHT GROUP */}
          <div className="flex items-center">
            {signedIn ? (
              hideAccountOnMyPortfolios ? null : (
                <Link
                  href="/account"
                  className="
                    hidden lg:flex
                    items-center justify-end
                    gap-[10px]
                    h-[35px]
                  "
                >
                  {/* Avatar */}
                  <span
                    className="
                      w-[35px] h-[35px]
                      rounded-full
                      overflow-hidden
                      bg-[#EDEDED]
                      flex items-center justify-center
                      flex-shrink-0
                    "
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[12px] font-inter text-[#262626]">
                        {initials}
                      </span>
                    )}
                  </span>

                  {/* Name */}
                  <span
                    className="
                      font-inter font-normal
                      text-[17px] leading-[140%]
                      text-[#262626]
                      text-right
                      whitespace-nowrap
                    "
                  >
                    {displayName || "Account"}
                  </span>
                </Link>
              )
            ) : (
              <Link
                href="/login"
                className="
                  hidden lg:flex
                  h-[24px]
                  items-center justify-center
                  text-[17px] leading-[140%]
                  font-normal text-center
                  text-[#262626]
                  whitespace-nowrap
                  transition-all duration-100 ease-out
                  hover:font-semibold
                "
              >
                Sign In
              </Link>
            )}

            {/* Mobile: keep simple */}
            <Link
              href="/explore"
              className="
                flex lg:hidden
                h-[24px]
                items-center justify-center
                text-[17px] leading-[140%]
                font-normal text-center
                text-[#262626]
                whitespace-nowrap
                transition-all duration-100 ease-out
                hover:font-semibold
              "
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
