"use client"

import PrimaryButton from "@/components/buttons/PrimaryButton"
import ArrowLeft from "@/components/icons/ArrowLeft"
import { useOnboardingDraft } from "@/stores/onboardingDraft"

type Props = {
  backHref: string
  nextHref: string
}

const REQUIRED_CODE = "konfolioB26"

export default function BetaAccessHostCard({ backHref, nextHref }: Props) {
  const betaCode = useOnboardingDraft((s) => s.betaCode)
  const setBetaCode = useOnboardingDraft((s) => s.setBetaCode)
  const setMode = useOnboardingDraft((s) => s.setMode)

  const trimmedCode = betaCode.trim()
  const showError = trimmedCode !== "" && trimmedCode !== REQUIRED_CODE
  const canContinue = trimmedCode === REQUIRED_CODE

  function handleNextClick() {
    if (!canContinue) return
    setMode("host")
  }

  return (
    <div
      className="
        relative
        w-[914px] h-[450px]
        flex flex-col justify-between items-center
        px-[244px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      <ArrowLeft href={backHref} className="absolute left-[45px] top-[50px]" />

      <div className="flex flex-col items-center gap-[15px]">
        <p className="m-0 text-center font-inter font-normal text-[15px] leading-[18px] text-black">
          Hello! Welcome to
        </p>

        <p
          className="m-0 text-center font-semibold leading-none tracking-[-0.02em] text-[#262626]"
          style={{
            fontFamily: "Inknut Antiqua",
            fontSize: "26.7475px",
          }}
        >
          konfolio
        </p>
      </div>

      <div className="w-[426px] flex flex-col gap-[6px]">
        <div className="w-full flex flex-col items-start gap-[10px]">
          <div className="flex items-center gap-[5px] py-[5px]">
            <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
              Beta Code
            </span>
            <span className="font-inter text-[17px] leading-[140%] text-[#A5A5A5]">
              *
            </span>
          </div>

          <div
            className={[
              "flex w-[426px] min-w-[240px] items-center rounded-[8px] border bg-white px-[16px] py-[12px]",
              showError ? "border-[#FF4603]" : "border-[#A5A5A5]/50",
            ].join(" ")}
          >
            <input
              type="text"
              value={betaCode}
              onChange={(e) => setBetaCode(e.target.value)}
              placeholder="Enter access code"
              className="w-full bg-transparent font-inter text-[15px] leading-[140%] text-[#262626] outline-none placeholder:text-[#A5A5A5]"
            />
          </div>

          {showError && (
            <p className="font-inter text-[12px] leading-[130%] text-[#FF4603]">
              Invalid access code
            </p>
          )}
        </div>

        <p className="font-inter text-[12px] leading-[130%] text-[#A5A5A5]">
          Need a code?{" "}
          <a
            href="mailto:konfolios@gmail.com"
            className="underline hover:opacity-70 transition"
          >
            Email
          </a>{" "}
          us for beta access.
        </p>
      </div>

      <PrimaryButton
        href={canContinue ? nextHref : "#"}
        onClick={handleNextClick}
        className={!canContinue ? "pointer-events-none opacity-40" : ""}
      >
        Next
      </PrimaryButton>
    </div>
  )
}