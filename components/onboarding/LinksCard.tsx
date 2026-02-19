// components/onboarding/LinksCard.tsx
"use client"

import { useMemo } from "react"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ArrowLeft from "@/components/icons/ArrowLeft"
import LinkDropdown, { isValidLinkForKey } from "@/components/onboarding/LinkDropdown"
import { useOnboardingDraft, type Mode } from "@/stores/onboardingDraft"

type Props = {
  mode: Mode
  backHref: string
  nextHref: string
}

export default function LinksCard({ mode, backHref, nextHref }: Props) {
  const activeKeys = useOnboardingDraft((s) => s.activeLinkKeys)
  const links = useOnboardingDraft((s) => s.links)

  const title =
    mode === "artist"
      ? "Links for reviewers to find you!"
      : "Links for applicants to find you!"

  const canContinue = useMemo(() => {
    return activeKeys.some((k) => isValidLinkForKey(k, links[k]))
  }, [activeKeys, links])

  return (
    <div
      className="
        relative
        w-[914px]
        min-h-[630px]
        flex flex-col
        items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Header row */}
      <div className="relative w-full flex items-center justify-center">
        <ArrowLeft href={backHref} className="absolute left-0" />
        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
          {title}
        </p>
      </div>

      {/* Middle */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto">
        <div className="w-full flex justify-center pt-[60px] pb-[33px]">
          <div className="w-[426px]">
            {/* Force the limit to 5 for onboarding */}
            <LinkDropdown maxLinks={5} />
          </div>
        </div>
      </div>

      {/* Next */}
      <PrimaryButton
        href={canContinue ? nextHref : "#"}
        className={!canContinue ? "pointer-events-none opacity-40" : ""}
      >
        Next
      </PrimaryButton>
    </div>
  )
}
