"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { inknut } from "@/app/fonts"

type Props = {
  signedIn?: boolean
  firstName?: string
  profileImageUrl?: string
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

export default function Navbar({
  signedIn = false,
  firstName = "Trinity",
  profileImageUrl,
}: Props) {
  const pathnameRaw = usePathname() || ""
  const pathname = normalizePath(pathnameRaw)

  const isExploreActive = pathname === "/explore" || pathname.startsWith("/explore/")
  const isPortfoliosActive =
    pathname === "/my-portfolios" || pathname.startsWith("/my-portfolios/")
  const isSupportActive = pathname === "/support" || pathname.startsWith("/support/")

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
                      {firstName?.[0]?.toUpperCase() ?? "U"}
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
                  {firstName}
                </span>
              </Link>
            ) : (
              <Link
                href="/onboarding/audience"
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
              href={signedIn ? "/explore" : "/explore"}
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
