"use client"

import { useRouter } from "next/navigation"
import AudienceOptionCard from "./AudienceOptionCard"
import { inknut } from "@/app/fonts"

export default function AudienceCard() {
  const router = useRouter()

  function go(next: "artist" | "host") {
    router.push(next === "artist"
      ? "/onboarding/name/artist"
      : "/onboarding/name/host"
    )
  }

  return (
    <div
      className="
        flex h-[453.56px] w-[914px] flex-col items-center
        gap-[70px] rounded-[15px] bg-white
        px-[244px] pt-[50px] pb-[100px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Text */}
      <div className="flex w-[124px] h-[53.56px] flex-col items-center gap-[15px]">
        <p className="m-0 text-center font-inter text-[15px] font-normal leading-[18px] text-black whitespace-nowrap">
          Hello! Welcome to
        </p>

        <div className="relative w-[124px] h-[27.56px]">
          <span
            className={`absolute left-[1.97px] top-[4.92px] ${inknut.className} font-semibold text-[#262626] text-[26.7475px] tracking-[-0.02em]`}
            style={{ WebkitTextStroke: "1.05132px #262626" }}
          >
            konfolio
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="flex h-[180px] w-[742px] flex-col items-center gap-[40px]">
        <div className="font-inter text-[16px] font-normal leading-[19px] text-black">
          I am an..
        </div>

        <div className="flex h-[128px] w-[742px] items-start gap-[30px]">
          <AudienceOptionCard
            title="Artist Vendor"
            description="I market products that I have personally designed or created."
            onClick={() => go("artist")}
          />
          <AudienceOptionCard
            title="Event Organizer"
            description="I host events where artist vendors can market their products."
            onClick={() => go("host")}
          />
        </div>
      </div>
    </div>
  )
}
