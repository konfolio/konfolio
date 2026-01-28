"use client"

import { useMemo, useState } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import CheckIcon from "@/components/icons/CheckIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"
import { useOnboardingDraft } from "@/stores/onboardingDraft"

type Props = {
  backHref: string
  nextHref: string
  businessName?: string
  title?: string
  maxPastVends?: number
}

function splitYear(label: string) {
  const trimmed = label.trim()

  const endYear = trimmed.match(/^(.*?)(\s(19|20)\d{2})$/)
  if (endYear) {
    return {
      name: endYear[1].trim(),
      year: endYear[2].trim(),
    }
  }

  const anyYear = trimmed.match(/(19|20)\d{2}/)
  if (anyYear) {
    const idx = trimmed.indexOf(anyYear[0])
    return {
      name: trimmed.slice(0, idx).trim(),
      year: anyYear[0],
      tail: trimmed.slice(idx + anyYear[0].length).trim(),
    }
  }

  return { name: trimmed, year: "" }
}

export default function PrevConsCard({
  backHref,
  nextHref,
  title = "Tell us where you’ve been!",
  maxPastVends = 4,
}: Props) {
  // ✅ Zustand state
  const firstVend = useOnboardingDraft((s) => s.firstVend)
  const prevVends = useOnboardingDraft((s) => s.prevVends)

  // ✅ Zustand setters (these must exist in your store)
  const setFirstVend = useOnboardingDraft((s) => s.setFirstVend)
  const setPrevVends = useOnboardingDraft((s) => s.setPrevVends)

  // local input only
  const [input, setInput] = useState("")

  const canContinue = useMemo(() => {
    return firstVend || prevVends.length > 0
  }, [firstVend, prevVends.length])

  const inputLocked = firstVend || prevVends.length >= maxPastVends

  function addVend() {
    const trimmed = input.trim()
    if (!trimmed) return
    if (prevVends.length >= maxPastVends) return
    if (prevVends.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setInput("")
      return
    }

    setPrevVends([...prevVends, trimmed])
    setInput("")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    if (inputLocked) return
    addVend()
  }

  function toggleFirstVend() {
    const next = !firstVend
    setFirstVend(next)

    if (next) {
      // if they say it's their first vend, clear any previous vends
      setPrevVends([])
      setInput("")
    }
  }

  function removeVend(v: string) {
    setPrevVends(prevVends.filter((x) => x !== v))
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
      {/* Header */}
      <div className="relative w-full flex items-center justify-center">
        <ArrowLeft
          href={backHref}
          className="absolute left-0 w-[40px] h-[40px] flex items-center justify-center"
        />

        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
          {title}
        </p>
      </div>

      <div className="w-[436px] h-[330px] flex flex-col items-start gap-[30px]">
        {/* Input */}
        <div className="w-[436px] flex flex-col items-start gap-[8px]">
          <p className="m-0 w-full font-inter font-normal text-[16px] leading-[140%] text-[#1E1E1E]">
            Previous Vending
          </p>

          <p className="m-0 font-inter font-normal text-[12px] leading-[140%] text-[#A5A5A5]">
            Max {maxPastVends} past vends
          </p>

          <input
            value={input}
            onChange={(e) => !inputLocked && setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Vended Event 2026"
            disabled={inputLocked}
            className={`
              w-full h-[40px]
              px-[12px]
              bg-white
              border border-[#A5A5A5]/50
              rounded-[8px]
              font-inter text-[14px]
              text-[#262626]
              placeholder:text-[#A5A5A5]
              outline-none
              ${inputLocked ? "opacity-50 cursor-not-allowed" : ""}
            `}
          />

          {/* First vend checkbox */}
          <button
            type="button"
            onClick={toggleFirstVend}
            className="mt-[6px] flex items-center gap-[7px] py-[5px]"
          >
            <span
              className={[
                "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
                firstVend ? "bg-[#262626]" : "bg-white border border-[#262626]",
              ].join(" ")}
              aria-hidden="true"
            >
              {firstVend && (
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

            <span className="font-inter font-normal text-[12px] leading-[140%] text-[#A5A5A5]">
              I’m looking for my first vend.
            </span>
          </button>
        </div>

        {/* List */}
        <div className="w-[436px] flex flex-col items-center gap-[15px]">
          <p className="m-0 w-full text-center font-inter font-normal text-[13px] leading-[16px] text-[#A5A5A5]">
            Previous Vends
          </p>

          <div className="w-full h-[150px] flex flex-col items-center gap-[10px]">
            {prevVends.length === 0 ? (
              <p className="m-0 w-full text-center font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
                —
              </p>
            ) : (
              prevVends.map((v) => {
                const { name, year, tail } = splitYear(v)

                return (
                  <div key={v} className="group relative w-full flex justify-center">
                    <p
                      className="
                        m-0
                        text-center
                        font-inter font-normal text-[15px] leading-[140%]
                        text-[#262626]
                        group-hover:text-[#A5A5A5]
                        transition-colors
                        whitespace-nowrap
                      "
                    >
                      <span>{name}</span>
                      {year && (
                        <span className="ml-[6px] italic text-[12px] text-[#A5A5A5]">
                          {year}
                        </span>
                      )}
                      {tail ? <span className="ml-[6px]">{tail}</span> : null}
                    </p>

                    {/* Hover delete pill */}
                    <button
                      type="button"
                      onClick={() => removeVend(v)}
                      aria-label={`Remove ${v}`}
                      className="
                        absolute
                        right-[-5.25px]
                        top-1/2
                        -translate-y-1/2
                        w-[17.25px]
                        h-[17.25px]
                        flex items-center justify-center
                        rounded-full
                        bg-[#A5A5A5]
                        z-[1]

                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        duration-150
                      "
                    >
                      <span className="w-[13.42px] h-[13.42px] flex items-center justify-center">
                        <DeleteIcon className="[&_path]:stroke-white [&_path]:fill-[#262626]" />
                      </span>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <PrimaryButton
        href={canContinue ? nextHref : "#"}
        className={!canContinue ? "pointer-events-none opacity-40" : ""}
      >
        Next
      </PrimaryButton>
    </div>
  )
}
