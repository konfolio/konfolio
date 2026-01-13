"use client"

import Image from "next/image"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon"

type Props = {
  businessName: string
  creatorName: string
  previewImageUrl: string
  avatarUrl?: string
  labels?: string[] // ✅ add this
  className?: string
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0.5 4.4375L3.5625 7.5L10.5625 0.5"
        stroke="#262626"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ExplorePortfolioCard({
  businessName,
  creatorName,
  previewImageUrl,
  avatarUrl,
  labels = [],
  className = "",
}: Props) {
  return (
    <div
      className={`
        group
        w-[390px] h-[320px]
        flex flex-col items-center
        pb-[10px]
        gap-[15px]
        drop-shadow-[2px_4px_25px_rgba(165,165,165,0.1)]
        ${className}
      `}
    >
      {/* ===== Preview ===== */}
      <div
        className="
          relative w-[390px] h-[260px] rounded-[15px] overflow-hidden
          transition-all duration-200 ease-out
          [backdrop-filter:blur(14.65328598022461px)]

          /* Base shadows (match Figma) */
          [box-shadow:1.93px_3.87px_24.16px_0px_rgba(165,165,165,0.102),inset_1.18px_1.1px_4.47px_0px_rgba(165,165,165,0.125),inset_2.07px_1.93px_8.93px_0px_rgba(165,165,165,0.125)]

          /* Hover shadow (match Figma) */
          group-hover:[box-shadow:2px_4px_25px_0px_rgba(165,165,165,0.4),1.93px_3.87px_24.16px_0px_rgba(165,165,165,0.102),inset_1.18px_1.1px_4.47px_0px_rgba(165,165,165,0.125),inset_2.07px_1.93px_8.93px_0px_rgba(165,165,165,0.125)]
        "
      >
        {/* Conic gradient border overlay (true border-image behavior via masking) */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-[15px]
            p-[1.5px]
            [background:conic-gradient(from_90deg_at_0%_0%,rgba(165,165,165,0)_-47.02deg,rgba(165,165,165,0.352)_42.98deg,rgba(165,165,165,0)_132.98deg,rgba(165,165,165,0.352)_222.98deg,rgba(165,165,165,0)_312.98deg,rgba(165,165,165,0.352)_402.98deg)]
            [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
            [mask-composite:exclude]
            [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
            [-webkit-mask-composite:xor]
          "
        />

        {/* Image */}
        <Image
          src={previewImageUrl}
          alt={`${businessName} preview`}
          fill
          className="object-cover transition-opacity duration-200 group-hover:opacity-90"
          sizes="390px"
        />

        <button
          type="button"
          className="absolute right-[15px] top-[15px] z-10"
          aria-label="More options"
        >
          <ThreeDotsIcon />
        </button>

        {/* Center button — appears on hover */}
        <div
          className="
            absolute inset-0 flex items-center justify-center
            opacity-0 pointer-events-none
            transition-opacity duration-150
            group-hover:opacity-100 group-hover:pointer-events-auto
          "
        >
            <PrimaryButton
                href={`/portfolio/${businessName}`}
                icon="open"
                className="h-[33px] min-w-[150px] px-[40px] py-[10px]"
            >
                View
            </PrimaryButton>
        </div>
      </div>

      {/* ===== Bottom Info ===== */}
      <div className="w-[390px] h-[35px] px-[15px] flex flex-col justify-center gap-[12px]">
        {/* Top row */}
        <div className="w-[360px] h-[13px] flex items-center justify-between">
          <div className="text-[17px] leading-[140%] font-normal text-[#262626]">
            {businessName}
          </div>

          <div className="flex items-center gap-[5px]">
            <div className="relative w-[13px] h-[13px] rounded-full overflow-hidden bg-[#D9D9D9]">
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt={`${creatorName} avatar`}
                  fill
                  className="object-cover"
                  sizes="13px"
                />
              )}
            </div>

            <div className="text-[14px] leading-[140%] font-normal text-[#262626]">
              {creatorName}
            </div>
          </div>
        </div>

        {/* Label row */}
        <div className="w-[360px] h-[10px] flex items-center justify-start gap-[11px]">
          {labels.slice(0, 3).map((label) => (
            <div key={label} className="flex items-center gap-[5px]">
              <CheckIcon className="w-[10px] h-[10px]" />
              <div className="text-[14px] leading-[140%] font-normal text-[#262626]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
