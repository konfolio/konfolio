"use client"

import { useRouter } from "next/navigation"
import { inknut } from "@/app/fonts"

export default function AuthHeader() {
  const router = useRouter()

  function handleHomeClick(e: React.MouseEvent) {
    e.preventDefault()

    // Ask onboarding guard if navigation should be blocked
    const attempted = (window as any).__konfolio_onboarding_attempt_nav?.("/")

    if (attempted) {
      // Guard will open modal — do nothing else
      return
    }

    // Safe to navigate
    router.push("/")
  }

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-[61px] w-[1512px] items-center justify-center px-[150px] pt-[15px] pb-[10px] max-w-full">
        <div className="flex h-[36px] w-[1212px] items-center justify-center max-w-full">
          <button onClick={handleHomeClick} className="flex items-center">
            <span
              className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold`}
            >
              konfolio
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}