"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import ArrowDown from "@/components/icons/ArrowDown"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import Tag from "@/components/onboarding/Tag"

type Props = {
  backHref: string
  nextHref: string
  businessName: string
  maxTags?: number
}

const COMMON = [
  "Acrylic Charm",
  "Vinyl Sticker",
  "Stamp Rally",
  "Print",
  "Photocard",
  "Enamel Pin",
] as const

type GroupKey =
  | "PRINT"
  | "STICKER"
  | "SMALL ACCESSORY"
  | "DESK & STATIONERY"
  | "APPEARAL & WEARABLE"
  | "INTERACTIVE"

type Row =
  | { type: "header"; label: GroupKey }
  | { type: "item"; label: string; group: GroupKey }

const ROWS: Row[] = [
  { type: "header", label: "PRINT" },
  { type: "item", group: "PRINT", label: "Lenticular" },
  { type: "item", group: "PRINT", label: "Photocard" },
  { type: "item", group: "PRINT", label: "Print" },
  { type: "item", group: "PRINT", label: "Risograph" },
  { type: "item", group: "PRINT", label: "Shikishi" },
  { type: "item", group: "PRINT", label: "Tarot" },
  { type: "item", group: "PRINT", label: "Zine" },
  { type: "item", group: "PRINT", label: "Multi Print - Low Accuracy" },

  { type: "header", label: "STICKER" },
  { type: "item", group: "STICKER", label: "Sticker Binder" },
  { type: "item", group: "STICKER", label: "Sticker Sheet" },
  { type: "item", group: "STICKER", label: "Vinyl Sticker" },
  { type: "item", group: "STICKER", label: "Multi Sticker - Low Accuracy" },

  { type: "header", label: "SMALL ACCESSORY" },
  { type: "item", group: "SMALL ACCESSORY", label: "Acrylic Charm" },
  { type: "item", group: "SMALL ACCESSORY", label: "Acrylic Pin" },
  { type: "item", group: "SMALL ACCESSORY", label: "Button" },
  { type: "item", group: "SMALL ACCESSORY", label: "Enamel Pin" },
  { type: "item", group: "SMALL ACCESSORY", label: "Phone Strap" },
  { type: "item", group: "SMALL ACCESSORY", label: "Photocard Holder" },
  { type: "item", group: "SMALL ACCESSORY", label: "Wooden Pin" },
  { type: "item", group: "SMALL ACCESSORY", label: "Multi Charm - Low Accuracy" },
  { type: "item", group: "SMALL ACCESSORY", label: "Multi Pin - Low Accuracy" },

  { type: "header", label: "DESK & STATIONERY" },
  { type: "item", group: "DESK & STATIONERY", label: "Album" },
  { type: "item", group: "DESK & STATIONERY", label: "Bookmark" },
  { type: "item", group: "DESK & STATIONERY", label: "Candle" },
  { type: "item", group: "DESK & STATIONERY", label: "Clip" },
  { type: "item", group: "DESK & STATIONERY", label: "Coaster" },
  { type: "item", group: "DESK & STATIONERY", label: "Diorama Standee" },
  { type: "item", group: "DESK & STATIONERY", label: "Glass Bottle" },
  { type: "item", group: "DESK & STATIONERY", label: "Key Cap" },
  { type: "item", group: "DESK & STATIONERY", label: "Magnet" },
  { type: "item", group: "DESK & STATIONERY", label: "Microfiber Cloth" },
  { type: "item", group: "DESK & STATIONERY", label: "Mouse Pad" },
  { type: "item", group: "DESK & STATIONERY", label: "Note Pad" },
  { type: "item", group: "DESK & STATIONERY", label: "Notebook" },
  { type: "item", group: "DESK & STATIONERY", label: "Pencil Case" },
  { type: "item", group: "DESK & STATIONERY", label: "Stamp" },
  { type: "item", group: "DESK & STATIONERY", label: "Standee" },
  { type: "item", group: "DESK & STATIONERY", label: "Table Cup" },
  { type: "item", group: "DESK & STATIONERY", label: "Washi Tape" },

  { type: "header", label: "APPEARAL & WEARABLE" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Bandana" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Beanie" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Blanket" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Bracelet" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Bucket Hat" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Cap" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Crewneck" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Earring" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Hair Clip" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Hoodie" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Ita Bag" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Leather Bag" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Nail Decal" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Necklace" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Phone Grip" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Plush Charm" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Plushie" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Pouch" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Shirt" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Sock" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Tote Bag" },

  { type: "header", label: "INTERACTIVE" },
  { type: "item", group: "INTERACTIVE", label: "Build Your Own" },
  { type: "item", group: "INTERACTIVE", label: "Gachapon" },
  { type: "item", group: "INTERACTIVE", label: "Mystery Bag" },
  { type: "item", group: "INTERACTIVE", label: "Stamp Rally" },
]

function normalize(s: string) {
  return s.trim().replace(/\s+/g, " ")
}
function keyify(s: string) {
  return normalize(s).toLowerCase()
}
function splitLowAccuracy(label: string) {
  const re = /\s*-\s*low accuracy\s*$/i
  const isLow = re.test(label)
  const base = isLow ? normalize(label.replace(re, "")) : normalize(label)
  return { base, isLow }
}

export default function MerchTypeCard({
  backHref,
  nextHref,
  businessName,
  maxTags = 8,
}: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const title = `Tell us more about ${businessName}`
  const limitReached = selected.length >= maxTags
  const canContinue = selected.length > 0

  const selectedSet = useMemo(() => new Set(selected.map(keyify)), [selected])

  // Build dropdown list as: Header + visible items beneath it
  const visibleRows = useMemo(() => {
    const q = keyify(query)

    const out: Row[] = []
    let currentHeader: GroupKey | null = null
    let headerAdded = false

    for (const row of ROWS) {
      if (row.type === "header") {
        currentHeader = row.label
        headerAdded = false
        continue
      }

      // item row
      if (selectedSet.has(keyify(row.label))) continue
      if (q && !keyify(row.label).includes(q)) continue

      // add header before the first visible item in that group
      if (!headerAdded && currentHeader) {
        out.push({ type: "header", label: currentHeader })
        headerAdded = true
      }

      out.push(row)
    }

    return out
  }, [query, selectedSet])

  function addTag(raw: string) {
    const label = normalize(raw)
    if (!label) return
    const k = keyify(label)
    if (selectedSet.has(k)) return
    if (limitReached) return
    setSelected((prev) => [...prev, label])
  }

  function removeTag(label: string) {
    const k = keyify(label)
    setSelected((prev) => prev.filter((t) => keyify(t) !== k))
  }

  function pickOption(label: string) {
    addTag(label)
    setQuery("")
    setOpen(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function onEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    if (limitReached) return

    const q = normalize(query)
    if (!q) return

    const exact = ROWS.find(
      (r) => r.type === "item" && keyify(r.label) === keyify(q)
    ) as Extract<Row, { type: "item" }> | undefined

    if (exact) {
      pickOption(exact.label)
      return
    }

    addTag(q)
    setQuery("")
    setOpen(false)
  }

  // close on outside click / esc
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  return (
    <div
      className="
        relative
        w-[914px] h-[630px]
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

      {/* Frame 115 */}
      <div className="w-[526px] h-[356px] flex flex-col items-center gap-[70px]">
        {/* Add Tag Field */}
        <div className="w-[526px] h-[177px] flex flex-col items-center gap-[20px]">
          {/* Input Field */}
          <div className="w-[397px] h-[70px] flex flex-col items-start gap-[8px]" ref={wrapRef}>
            <p className="m-0 w-full font-inter font-normal text-[16px] leading-[140%] text-[#1E1E1E]">
              Merchandise Category
            </p>

            <div className="relative w-[397px] h-[40px]">
              <div
                className={`
                  w-full h-full
                  flex items-center
                  px-[10px] py-[12px]
                  border border-[#A5A5A5]/50
                  rounded-[8px]
                  bg-white
                  gap-[10px]
                  ${limitReached ? "opacity-60" : ""}
                `}
                onClick={() => {
                  if (limitReached) return
                  setOpen(true)
                  requestAnimationFrame(() => inputRef.current?.focus())
                }}
              >
                <input
                  ref={inputRef}
                  value={query}
                  disabled={limitReached}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => !limitReached && setOpen(true)}
                  onKeyDown={onEnter}
                  placeholder="Select or type a category"
                  className="
                    flex-1
                    bg-transparent
                    outline-none
                    font-inter font-normal text-[14px] leading-[140%]
                    text-[#262626]
                    placeholder:text-[#A5A5A5]
                    disabled:cursor-not-allowed
                  "
                />

                <button
                  type="button"
                  disabled={limitReached}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (limitReached) return
                    setOpen((v) => !v)
                    requestAnimationFrame(() => inputRef.current?.focus())
                  }}
                  className="w-[16px] h-[16px] flex items-center justify-center text-[#A5A5A5] disabled:cursor-not-allowed"
                  aria-label="Toggle dropdown"
                >
                  <ArrowDown />
                </button>
              </div>

              {/* Dropdown (scrollable) */}
              {open && !limitReached && (
                <div
                  className="
                    absolute left-0 top-[44px]
                    w-[397px]
                    bg-white
                    border border-[#A5A5A5]/50
                    rounded-[8px]
                    px-[10px] py-[10px]
                    z-50
                  "
                >
                  <div className="max-h-[260px] overflow-y-auto pr-[4px]">
                    {/* no matches -> allow add */}
                    {visibleRows.filter((r) => r.type === "item").length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          addTag(query)
                          setQuery("")
                          setOpen(false)
                        }}
                        className="
                          w-full text-left
                          px-[8px] py-[8px]
                          rounded-[6px]
                          hover:bg-[#F7F7F7]
                          font-inter text-[14px] leading-[140%] text-[#262626]
                        "
                      >
                        Add “{normalize(query) || "New category"}”
                      </button>
                    ) : (
                      <div className="flex flex-col">
                        {visibleRows.map((row, idx) => {
                          if (row.type === "header") {
                            return (
                              <div
                                key={`h-${row.label}-${idx}`}
                                className="
                                  px-[8px] pt-[10px] pb-[6px]
                                  font-inter font-normal
                                  text-[12px] leading-[140%]
                                  text-[#A5A5A5]
                                "
                              >
                                {row.label}
                              </div>
                            )
                          }

                          const { base, isLow } = splitLowAccuracy(row.label)

                          return (
                            <button
                              key={`i-${row.label}-${idx}`}
                              type="button"
                              onClick={() => pickOption(row.label)}
                              className="
                                w-full
                                flex items-center justify-between
                                gap-[10px]
                                text-left
                                px-[8px] py-[8px]
                                rounded-[6px]
                                hover:bg-[#F7F7F7]
                              "
                            >
                              <span className="font-inter text-[14px] leading-[140%] text-[#262626]">
                                {base}
                              </span>

                              {isLow ? (
                                <span
                                  className="
                                    font-inter font-normal
                                    text-[9px] leading-[100%]
                                    text-[#A5A5A5]
                                    whitespace-nowrap
                                  "
                                >
                                  Low Accuracy
                                </span>
                              ) : (
                                <span />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Commonly Selected */}
          <div className="w-[526px] h-[87px] flex flex-col items-center gap-[15px]">
            <p className="m-0 font-inter font-normal text-[14px] leading-[140%] text-[#A5A5A5] text-center">
              Commonly Selected
            </p>

            <div className="w-[526px] h-[62px] flex flex-row flex-wrap justify-center items-center content-center gap-[10px]">
              {COMMON.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addTag(label)}
                  className={limitReached ? "pointer-events-none opacity-50" : "hover:opacity-80"}
                >
                  <Tag label={label} showPlus />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Your Merch Tags */}
        <div className="w-[526px] h-[109px] flex flex-col items-center gap-[15px]">
          <p className="m-0 font-inter font-normal text-[14px] leading-[140%] text-[#A5A5A5] text-center">
            Your Merchandise
          </p>

          <div className="w-[526px] h-[80px] flex flex-row flex-wrap justify-center items-center content-center gap-[10px]">
            {selected.length === 0 ? (
              <p className="m-0 font-inter text-[12px] leading-[140%] text-[#A5A5A5]">
                Add at least 1 category above
              </p>
            ) : (
              selected.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => removeTag(label)}
                  title="Click to remove"
                  className="hover:opacity-80"
                >
                  <Tag label={label} />
                </button>
              ))
            )}
          </div>

          {/* Limit reached caption */}
          <div className="h-[9px]">
            {limitReached && (
              <p className="m-0 font-inter font-normal text-[12px] leading-[140%] text-[#FF4603]">
                Limit Reached
              </p>
            )}
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
