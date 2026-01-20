"use client"

import { useMemo, useState } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import CheckIcon from "@/components/icons/CheckIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"

type Props = {
  backHref: string
  nextHref: string
  businessName?: string
  title?: string
  maxPastVends?: number
}

function splitYear(label: string) {
  const trimmed = label.trim()

  // Prefer a year at the end: "Anime Expo 2025"
  const endYear = trimmed.match(/^(.*?)(\s(19|20)\d{2})$/)
  if (endYear) {
    return {
      name: endYear[1].trim(),
      year: endYear[2].trim(), // includes leading space, we trimmed
    }
  }

  // Fallback: first 4-digit year anywhere
  const anyYear = trimmed.match(/(19|20)\d{2}/)
  if (anyYear) {
    const idx = trimmed.indexOf(anyYear[0])
    return {
      name: trimmed.slice(0, idx).trim(),
      year: anyYear[0],
      tail: trimmed.slice(idx + anyYear[0].length).trim(), // optional extra
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
  const [firstVend, setFirstVend] = useState(false)
  const [input, setInput] = useState("")
  const [vends, setVends] = useState<string[]>([])

  const canContinue = useMemo(() => {
    return firstVend || vends.length > 0
  }, [firstVend, vends.length])

  function addVend() {
    const trimmed = input.trim()
    if (!trimmed) return
    if (vends.length >= maxPastVends) return
    if (vends.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setInput("")
      return
    }
    setVends((prev) => [...prev, trimmed])
    setInput("")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (firstVend) return
      if (vends.length >= maxPastVends) return
      addVend()
    }
  }

  function toggleFirstVend() {
    setFirstVend((prev) => {
      const next = !prev
      if (next) {
        setInput("")
        setVends([])
      }
      return next
    })
  }

  function removeVend(v: string) {
    setVends((prev) => prev.filter((x) => x !== v))
  }

  const inputLocked = firstVend || vends.length >= maxPastVends

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
        <div className="w-[436px] flex flex-col items-start gap-[8px]">
          <p className="m-0 w-full font-inter font-normal text-[16px] leading-[140%] text-[#1E1E1E]">
            Previous Vending
          </p>

          <p className="m-0 font-inter font-normal text-[12px] leading-[140%] text-[#A5A5A5]">
            Max {maxPastVends} past vends
          </p>

          <div className="w-[436px] h-[40px]">
            <input
              value={input}
              onChange={(e) => {
                if (inputLocked) return
                setInput(e.target.value)
              }}
              onKeyDown={onKeyDown}
              placeholder="Vended Event 2026"
              disabled={inputLocked}
              className={`
                w-full h-full
                px-[12px]
                bg-white
                border border-[#A5A5A5]/50
                rounded-[8px]
                font-inter font-normal text-[14px] leading-[140%]
                text-[#262626]
                placeholder:text-[#A5A5A5]
                outline-none
                ${inputLocked ? "opacity-50 cursor-not-allowed" : ""}
              `}
            />
          </div>

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

        <div className="w-[436px] flex flex-col items-center gap-[15px]">
          <p className="m-0 w-full text-center font-inter font-normal text-[13px] leading-[16px] text-[#A5A5A5]">
            Previous Vends
          </p>

          <div className="w-full h-[150px] flex flex-col items-center gap-[10px]">
            {vends.length === 0 ? (
              <p className="m-0 w-full text-center font-inter font-normal text-[15px] leading-[140%] text-[#A5A5A5]">
                —
              </p>
            ) : (
              vends.map((v) => {
                const { name, year, tail } = splitYear(v)

                return (
                  <div
                    key={v}
                    className="
                      group
                      w-full
                      flex items-center justify-center
                      relative
                    "
                  >
                    {/* Event text (turn gray on hover) */}
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
                        <span
                          className="
                            ml-[6px]
                            font-inter
                            italic
                            text-[12px]
                            leading-[140%]
                            text-[#A5A5A5]
                          "
                        >
                          {year}
                        </span>
                      )}
                      {tail ? <span className="ml-[6px]">{tail}</span> : null}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeVend(v)}
                      className="
                        absolute right-0
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        w-[16px] h-[16px]
                        flex items-center justify-center
                      "
                      aria-label={`Remove ${v}`}
                    >
                      <span className="scale-[2] flex items-center justify-center">
                        <DeleteIcon className="[&_path]:stroke-[#A5A5A5]" />
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
