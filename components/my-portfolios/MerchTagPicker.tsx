"use client"

import { useMemo, useRef, useState } from "react"
import Tag from "@/components/onboarding/Tag"
import DeleteIcon from "@/components/icons/DeleteIcon"
import PopoverArrow from "@/components/icons/PopoverArrow"
import useClickOutside from "@/components/hooks/useClickOutside"

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

type Props = {
  maxTags?: number
  onMerchClick?: () => void

  /** Controlled mode (optional): */
  value?: string[]
  onChange?: (next: string[]) => void
}

export default function MerchTagPicker({ maxTags = 8, onMerchClick, value, onChange }: Props) {
  // internal fallback (uncontrolled mode)
  const [internalSelected, setInternalSelected] = useState<string[]>([])

  const selected = value ?? internalSelected
  const setSelected = (next: string[]) => {
    onChange?.(next)
    if (value === undefined) setInternalSelected(next)
  }

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const limitReached = selected.length >= maxTags
  const selectedSet = useMemo(() => new Set(selected.map(keyify)), [selected])

  useClickOutside(wrapRef, () => setOpen(false), { enabled: open, closeOnEsc: true })

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

      if (selectedSet.has(keyify(row.label))) continue
      if (q && !keyify(row.label).includes(q)) continue

      if (!headerAdded && currentHeader) {
        out.push({ type: "header", label: currentHeader })
        headerAdded = true
      }

      out.push(row)
    }

    return out
  }, [query, selectedSet])

  const addTag = (raw: string) => {
    const label = normalize(raw)
    if (!label) return
    const k = keyify(label)
    if (selectedSet.has(k)) return
    if (limitReached) return
    setSelected([...selected, label])
  }

  const removeTag = (label: string) => {
    const k = keyify(label)
    setSelected(selected.filter((t) => keyify(t) !== k))
  }

  const pickOption = (label: string) => {
    addTag(label)
    setQuery("")
    setOpen(false) // auto close
  }

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    if (limitReached) return

    const q = normalize(query)
    if (!q) return

    const exact = ROWS.find((r) => r.type === "item" && keyify(r.label) === keyify(q)) as
      | Extract<Row, { type: "item" }>
      | undefined

    if (exact) {
      pickOption(exact.label)
      return
    }

    addTag(q)
    setQuery("")
    setOpen(false)
  }

  return (
    <div className="w-[276px] flex flex-col items-center gap-[12px]">
      {/* Selected tags */}
      {selected.length > 0 ? (
        <div className="w-[276px] flex flex-row flex-wrap justify-center items-center content-center gap-[10px]">
          {selected.map((label) => (
            <div key={label} className="relative group">
              <Tag label={label} />
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => removeTag(label)}
                className="
                  absolute
                  right-[-5.25px] top-1/2 -translate-y-1/2
                  w-[17.25px] h-[17.25px]
                  flex items-center justify-center
                  bg-[#A5A5A5]
                  rounded-full
                  opacity-0 transition-opacity
                  group-hover:opacity-100
                  z-10
                  [&_path]:stroke-[#FFFFFF]
                  [&_path]:fill-[#FFFFFF]
                "
              >
                <DeleteIcon className="w-[13.42px] h-[13.42px]" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add Merch trigger */}
      <div className="relative w-full flex justify-center" ref={wrapRef}>
        <button
          type="button"
          disabled={limitReached}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (limitReached) return
            setOpen((v) => !v)
            onMerchClick?.()
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
          className={limitReached ? "pointer-events-none opacity-60" : "hover:opacity-90"}
          aria-label="Add merch tags"
        >
          <Tag
            label="Merch"
            showPlus
            className="
              border-[#A5A5A5]/50
              text-[#A5A5A5]
              [&_span]:text-[#A5A5A5]
              [&_svg]:text-[#A5A5A5]
              cursor-pointer
            "
          />
        </button>

        {/* Dropdown */}
        {open && !limitReached ? (
          <div
            className="
              absolute left-1/2 -translate-x-1/2 top-[34px]
              w-[276px]
              bg-white
              rounded-[15px]
              shadow-[5px_5px_25px_rgba(0,0,0,0.05)]
              p-[10px]
              z-[70]
            "
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-[-6px] z-[80] pointer-events-none">
              <PopoverArrow className="w-[27px] h-[8px] block" />
            </div>

            <div
              className="
                w-full
                flex items-center
                px-[10px] py-[10px]
                border border-[#A5A5A5]/50
                rounded-[10px]
                bg-white
                gap-[8px]
              "
              onClick={() => requestAnimationFrame(() => inputRef.current?.focus())}
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onEnter}
                placeholder="Select or type a category"
                className="
                  flex-1
                  bg-transparent
                  outline-none
                  font-inter font-normal text-[14px] leading-[140%]
                  text-[#262626]
                  placeholder:text-[#A5A5A5]
                "
              />
            </div>

            {/* Commonly Selected: one per line */}
            <div className="pt-[10px]">
              <p className="m-0 pb-[6px] font-inter font-normal text-[12px] leading-[140%] text-[#A5A5A5]">
                Commonly Selected
              </p>

              <div className="flex flex-col gap-[8px]">
                {COMMON.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      addTag(label)
                      setQuery("")
                      setOpen(false)
                    }}
                    className="w-full flex justify-center hover:opacity-80"
                  >
                    <Tag label={label} showPlus />
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="pt-[10px]">
              <div className="max-h-[230px] overflow-y-auto pr-[4px]">
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
                      rounded-[8px]
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
                            rounded-[8px]
                            hover:bg-[#F7F7F7]
                          "
                        >
                          <span className="font-inter text-[14px] leading-[140%] text-[#262626]">{base}</span>

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
          </div>
        ) : null}
      </div>
    </div>
  )
}
