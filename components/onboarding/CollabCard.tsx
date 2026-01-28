"use client"

import { useMemo } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import CheckIcon from "@/components/icons/CheckIcon"
import { useOnboardingDraft, type CollabOption } from "@/stores/onboardingDraft"

type Props = {
  backHref: string
  nextHref: string
  title?: string
}

const OPTIONS: CollabOption[] = [
  "Stamp Rally",
  "Share Table",
  "Other Collabs",
  "Not open for collabs",
]

export default function CollabCard({
  backHref,
  nextHref,
  title = "Are you open for artist collabs?",
}: Props) {
  const collabs = useOnboardingDraft((s) => s.collabs)
  const setCollabs = useOnboardingDraft((s) => s.setCollabs)

  const selectedSet = useMemo(() => new Set<CollabOption>(collabs), [collabs])
  const canContinue = collabs.length > 0

  function toggle(option: CollabOption) {
    const next = new Set<CollabOption>(selectedSet)

    if (option === "Not open for collabs") {
      if (next.has(option)) next.delete(option)
      else {
        next.clear()
        next.add(option)
      }
      setCollabs(Array.from(next))
      return
    }

    // selecting any other option removes "Not open..."
    next.delete("Not open for collabs")

    if (next.has(option)) next.delete(option)
    else next.add(option)

    setCollabs(Array.from(next))
  }

  return (
    <div
      className="
        relative
        w-[914px] h-[579px]
        flex flex-col justify-between items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Header row */}
      <div className="relative w-full flex items-center justify-center">
        <ArrowLeft
          href={backHref}
          className="absolute left-0 w-[40px] h-[40px] flex items-center justify-center"
        />

        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
          {title}
        </p>
      </div>

      {/* Middle block — shifted DOWN */}
      <div className="w-[222px] h-[204px] flex flex-col items-start gap-[50px] mt-[60px]">
        <p className="m-0 font-inter font-normal text-[17px] leading-[140%] text-[#262626] whitespace-nowrap">
          I am open for these collabs:
        </p>

        <div className="w-[186px] flex flex-col items-start gap-[30px]">
          {OPTIONS.map((label) => {
            const checked = selectedSet.has(label)

            return (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                className="flex items-center gap-[10px] p-0 bg-transparent border-0 cursor-pointer"
              >
                {/* Checkbox */}
                <span
                  className={[
                    "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
                    checked ? "bg-[#262626]" : "bg-white border border-[#262626]",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {checked && (
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

                <span className="font-inter font-normal text-[17px] leading-[140%] text-[#262626]">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Extra space before Next */}
      <div className="h-[100px]" />

      {/* Next */}
      <div className="flex justify-center w-auto">
        <PrimaryButton
          href={canContinue ? nextHref : "#"}
          className={!canContinue ? "pointer-events-none opacity-40" : ""}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
