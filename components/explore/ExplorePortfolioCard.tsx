"use client"

import Image from "next/image"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon"

type Props = {
  portfolioId: string
  businessName: string
  creatorName: string
  previewImageUrl: string
  avatarUrl?: string
  labels?: string[]
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

const GRID_BASE_SHADOW =
  "2px 4px 25px rgba(165,165,165,0.1), inset 2.14645px 2.00046px 9.24px rgba(165,165,165,0.126), inset 1.21725px 1.13446px 4.62px rgba(165,165,165,0.126), inset 0 0 0 1px rgba(255,255,255,0.9)"

const GRID_HOVER_SHADOW =
  "2px 4px 25px rgba(165,165,165,0.14), inset 2.14645px 2.00046px 9.24px rgba(165,165,165,0.126), inset 1.21725px 1.13446px 4.62px rgba(165,165,165,0.126), inset 0 0 0 1px rgba(255,255,255,0.9)"

export default function ExplorePortfolioCard({
  portfolioId,
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
        ${className}
      `}
    >
      <div
        className="
          relative w-[390px] h-[260px]
          rounded-[15px] overflow-hidden
          bg-[rgba(165,165,165,0.068)]
          border border-white
          transition-shadow duration-200 ease-out
          [backdrop-filter:blur(14.65328598022461px)]
          group-hover:[box-shadow:var(--hoverShadow)]
        "
        style={
          {
            boxShadow: GRID_BASE_SHADOW,
            "--hoverShadow": GRID_HOVER_SHADOW,
          } as React.CSSProperties
        }
      >
        <div
          className="
            pointer-events-none absolute inset-0 rounded-[15px]
            p-[1.5px]
            [background:conic-gradient(from_90deg_at_0%_0%,rgba(165,165,165,0)_-47.02deg,rgba(165,165,165,0.22)_42.98deg,rgba(165,165,165,0)_132.98deg,rgba(165,165,165,0.22)_222.98deg,rgba(165,165,165,0)_312.98deg,rgba(165,165,165,0.22)_402.98deg)]
            [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
            [mask-composite:exclude]
            [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
            [-webkit-mask-composite:xor]
          "
        />

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

        <div
          className="
            absolute inset-0 flex items-center justify-center
            opacity-0 pointer-events-none
            transition-opacity duration-150
            group-hover:opacity-100 group-hover:pointer-events-auto
          "
        >
          <PrimaryButton
            href={`/explore/${portfolioId}`}
            icon="open"
            className="h-[33px] min-w-[150px] px-[40px] py-[10px]"
          >
            View
          </PrimaryButton>
        </div>
      </div>

      <div className="w-[390px] h-[35px] px-[15px] flex flex-col justify-center gap-[12px]">
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