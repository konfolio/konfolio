"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { inknut } from "@/app/fonts"

const navBtn =
  "h-[24px] flex items-center justify-center text-[17px] leading-[140%] font-normal text-center text-zinc-900 whitespace-nowrap transition-all duration-100 ease-out hover:font-semibold"

export default function Navbar() {
  const pathnameRaw = usePathname() || ""
  const pathname = pathnameRaw.endsWith("/") && pathnameRaw !== "/" ? pathnameRaw.slice(0, -1) : pathnameRaw
  const isExploreActive = pathname === "/explore" || pathname.startsWith("/explore/")

  return (
    <nav className="w-full h-[61px] bg-white">
      <div className="h-full px-[25px] sm:px-10 lg:px-[150px] pt-[15px] pb-[10px] flex items-center">
        <div className="w-full max-w-[1212px] h-[36px] mx-auto flex items-center justify-between">
          {/* LEFT GROUP */}
          <div className="flex items-center gap-[18px] lg:gap-[42px]">
            <Link href="/" className="flex items-center">
              <span
                className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold text-[#262626]`}
              >
                konfolio
              </span>
            </Link>

            {/* Desktop Explore w/ active underline */}
            <Link
              href="/explore"
              className="hidden lg:flex flex-col items-start pt-[6px] gap-[6px] w-[62px] h-[24px]"
            >
              {/* text */}
              <span
                className={`w-[62px] h-[12px] flex items-center justify-center text-[17px] leading-[21px] text-[#262626] ${
                  isExploreActive ? "font-semibold" : "font-normal hover:font-semibold"
                }`}
              >
                Explore
              </span>

              {/* underline (Line 1) */}
              <span
                className={`w-[62px] h-0 border border-[#262626] self-stretch ${
                  isExploreActive ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>
          </div>

          {/* RIGHT GROUP */}
          <div className="flex items-center">
            {/* Desktop Sign In (UNCHANGED styling) */}
            <Link href="/onboarding/audience" className={`hidden lg:flex w-[55px] ${navBtn}`}>
              Sign In
            </Link>

            {/* Mobile Explore */}
            <Link href="/explore" className={`flex lg:hidden w-[60px] ${navBtn}`}>
              Explore
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
