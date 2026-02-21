"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ImageIcon from "@/components/icons/ImageIcon"
import SlidersIcon from "@/components/icons/SlidersIcon"
import EditImagePopover, { type ImageEdits } from "@/components/my-portfolios/EditImagePopover"

type Cell = {
  id: string
  src?: string
  title?: string
  description?: string
  edits?: ImageEdits
}

type Props = {
  images?: Cell[]
  onChangeImages?: (images: Cell[]) => void
  previousVendsLabel?: string
  /**
   * One-line string separated by " | "
   * e.g. "Anime Expo 2024 | Fanime 2025"
   * If it is "Vended Event 2026", we treat as empty (sample state).
   */
  previousVendsValue?: string
}

const RECOMMENDED = [
  "Your Product",
  "Most Recent Work",
  "Your Product",
  "Most Recent Work",
  "You & Table Display",
  "Most Recent Work",
  "Your Product",
  "Most Recent Work",
] as const

const DEFAULT_EDITS: ImageEdits = {
  rotate: 50,
  zoom: 0,
  brightness: 50,
  contrast: 50,
  saturation: 50,
  temperature: 50,
}

function makeDefaultCells(): Cell[] {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: String(i),
    src: "",
    title: "Title",
    description: "Short description",
    edits: { ...DEFAULT_EDITS },
  }))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function editsToImgStyle(edits?: ImageEdits): React.CSSProperties {
  const e = edits ?? DEFAULT_EDITS

  const rotateDeg = ((clamp(e.rotate, 0, 100) - 50) / 50) * 180
  const zoomScale = 1 + (clamp(e.zoom, 0, 100) / 100) * 1.0

  const brightnessVal = 0.5 + (clamp(e.brightness, 0, 100) / 100) * 1.0
  const contrastVal = 0.5 + (clamp(e.contrast, 0, 100) / 100) * 1.0
  const saturateVal = clamp(e.saturation, 0, 100) / 50

  const hueRotateDeg = ((clamp(e.temperature, 0, 100) - 50) / 50) * 30
  const warm = Math.max(0, clamp(e.temperature, 0, 100) - 50) / 50
  const sepiaVal = warm * 0.25

  return {
    transformOrigin: "center",
    transform: `scale(${zoomScale}) rotate(${rotateDeg}deg)`,
    filter: `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal}) sepia(${sepiaVal}) hue-rotate(${hueRotateDeg}deg)`,
    willChange: "transform, filter",
  }
}

function parseEventLine(line: string): { title: string; year?: string } {
  const trimmed = (line || "").trim()
  if (!trimmed) return { title: "" }

  const m = trimmed.match(/^(.*?)(?:\s*\(?(\d{4})\)?)\s*$/)
  if (!m) return { title: trimmed }

  const maybeTitle = (m[1] ?? "").trim()
  const maybeYear = m[2]

  if (maybeYear && maybeTitle.length > 0) return { title: maybeTitle, year: maybeYear }
  return { title: trimmed }
}

const splitPrevVendsValue = (raw: string) =>
  (raw || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)

export default function EditPortraitImageGrid({
  images,
  onChangeImages,
  previousVendsLabel = "Previous Vends",
  previousVendsValue = "Vended Event 2026",
}: Props) {
  const [cells, setCells] = useState<Cell[]>(() => {
    const incoming = images?.slice(0, 8)
    return incoming && incoming.length > 0
      ? incoming.concat(makeDefaultCells()).slice(0, 8)
      : makeDefaultCells()
  })

  const syncingFromPropsRef = useRef(false)
  useEffect(() => {
    if (!images) return
    syncingFromPropsRef.current = true

    const incoming = images.slice(0, 8)
    const next =
      incoming.length > 0
        ? incoming.concat(makeDefaultCells()).slice(0, 8)
        : makeDefaultCells()

    // ensure edits exist
    const normalized = next.map((c, i) => ({
      id: c.id ?? String(i),
      src: c.src ?? "",
      title: c.title ?? "Title",
      description: c.description ?? "Short description",
      edits: c.edits ?? { ...DEFAULT_EDITS },
    }))

    setCells(normalized)
  }, [images])

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [openEditorIdx, setOpenEditorIdx] = useState<number | null>(null)

  // --- Previous Vends (one-line, separated by |) ---
  const [localPrevVends, setLocalPrevVends] = useState<string[]>([])
  const [newVend, setNewVend] = useState("")
  const addInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const incoming = splitPrevVendsValue(previousVendsValue)
    const isJustSample = incoming.length === 1 && incoming[0]?.toLowerCase() === "vended event 2026"
    setLocalPrevVends(isJustSample ? [] : incoming.slice(0, 4))
  }, [previousVendsValue])

  const hasAnyEvents = localPrevVends.length > 0
  const vendPlaceholder = hasAnyEvents ? "Type an event..." : "Vended Event 2026"

  const addVend = (raw: string) => {
    const text = (raw || "").trim()
    if (!text) return
    if (localPrevVends.length >= 4) return
    setLocalPrevVends((prev) => [...prev, text].slice(0, 4))
    setNewVend("")
    addInputRef.current?.focus()
  }

  const parsedPrevVends = useMemo(() => localPrevVends.map(parseEventLine), [localPrevVends])

  // --- object url cleanup ---
  const objectUrls = useRef<string[]>([])
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u))
      objectUrls.current = []
    }
  }, [])

  // --- IMPORTANT FIX: don't emit to parent inside setCells updater ---
  const pendingEmitRef = useRef<Cell[] | null>(null)

  const updateCells = (updater: (prev: Cell[]) => Cell[]) => {
    setCells((prev) => {
      const next = updater(prev)
      pendingEmitRef.current = next
      return next
    })
  }

  useEffect(() => {
    if (syncingFromPropsRef.current) {
      syncingFromPropsRef.current = false
      pendingEmitRef.current = null
      return
    }

    const pending = pendingEmitRef.current
    if (!pending) return

    if (pending === cells) {
      onChangeImages?.(pending)
      pendingEmitRef.current = null
    }
  }, [cells, onChangeImages])

  const openFilePicker = (idx: number) => inputsRef.current[idx]?.click()

  const setImageFromFile = (idx: number, file: File) => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)

    updateCells((prev) => {
      const next = [...prev]
      const existing = next[idx] ?? { id: String(idx) }
      next[idx] = {
        ...existing,
        src: url,
        title: existing.title ?? "Title",
        description: existing.description ?? "Short description",
        edits: existing.edits ?? { ...DEFAULT_EDITS },
      }
      return next
    })
  }

  const onInputChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFromFile(idx, file)
    e.target.value = ""
  }

  const onDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx(idx)
  }

  const onDragLeave = (idx: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx((cur) => (cur === idx ? null : cur))
  }

  const onDrop = (idx: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx(null)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setImageFromFile(idx, file)
  }

  return (
    <section className="w-[1512px] flex flex-col items-center">
      <div className="h-[20px]" />

      <div className="w-[1512px] h-[815px] flex flex-col items-center">
        {/* allow popovers to escape */}
        <div className="w-[1182.3px] h-[731px] relative overflow-visible">
          <div className="grid grid-cols-4 gap-[15px] overflow-visible">
            {cells.map((cell, idx) => {
              const hasImage = Boolean(cell.src)
              const isDragOver = dragOverIdx === idx
              const isEditorOpen = openEditorIdx === idx

              const col = idx % 4
              const placement: "right" | "left" = col === 3 ? "left" : "right"

              const imgStyle = useMemo(() => editsToImgStyle(cell.edits), [cell.edits])

              return (
                <div
                  key={cell.id ?? String(idx)}
                  className={`
                    group relative
                    w-[274px] h-[345px]
                    rounded-[15px]
                    overflow-visible
                    bg-[rgba(165,165,165,0.068)]
                    border border-white
                    transition
                    ${isDragOver ? "border-dashed" : ""}
                    ${isEditorOpen ? "z-[200]" : "z-[0]"}
                  `}
                  style={{
                    boxShadow:
                      "2px 4px 25px rgba(165,165,165,0.1), inset 2.14645px 2.00046px 9.24px rgba(165,165,165,0.126), inset 1.21725px 1.13446px 4.62px rgba(165,165,165,0.126), inset 0 0 0 1px rgba(255,255,255,0.9)",
                    backdropFilter: "blur(7.58px)",
                  }}
                  onDragOver={(e) => onDragOver(idx, e)}
                  onDragLeave={(e) => onDragLeave(idx, e)}
                  onDrop={(e) => onDrop(idx, e)}
                >
                  <input
                    ref={(el) => {
                      inputsRef.current[idx] = el
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onInputChange(idx, e)}
                  />

                  {/* Click target behind controls */}
                  <button
                    type="button"
                    className="absolute inset-0 z-[0] bg-transparent"
                    aria-label={`Upload image ${idx + 1}`}
                    onClick={() => {
                      if (isEditorOpen) return
                      openFilePicker(idx)
                    }}
                  />

                  {/* Sliders icon: ONLY on hover */}
                  <button
                    type="button"
                    aria-label="Image settings"
                    className="
                      absolute right-[10px] top-[10px]
                      hidden group-hover:flex
                      w-[24px] h-[24px]
                      items-center justify-center
                      z-[10]
                      cursor-pointer
                    "
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenEditorIdx((cur) => (cur === idx ? null : idx))
                    }}
                  >
                    <SlidersIcon />
                  </button>

                  {/* Popover */}
                  {isEditorOpen && (
                    <EditImagePopover
                      title={`Recommended - ${RECOMMENDED[idx] ?? "Image"}`}
                      imageSrc={cell.src}
                      onClose={() => setOpenEditorIdx(null)}
                      placement={placement}
                      variant="portrait"
                      titleText={cell.title ?? "Title"}
                      descriptionText={cell.description ?? "Short description"}
                      edits={cell.edits ?? { ...DEFAULT_EDITS }}
                      onChangeMeta={({ title, description }) => {
                        updateCells((prev) => {
                          const next = [...prev]
                          const existing = next[idx] ?? { id: String(idx) }
                          next[idx] = { ...existing, title, description }
                          return next
                        })
                      }}
                      onChangeEdits={(nextEdits) => {
                        updateCells((prev) => {
                          const next = [...prev]
                          const existing = next[idx] ?? { id: String(idx) }
                          next[idx] = { ...existing, edits: nextEdits }
                          return next
                        })
                      }}
                    />
                  )}

                  {/* Image preview */}
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cell.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1] rounded-[15px]"
                      style={imgStyle}
                      draggable={false}
                    />
                  ) : null}

                  {/* Recommended state */}
                  {!hasImage && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[5px] z-[1]">
                      <div className="w-[52px] h-[52px] flex items-center justify-center text-[#A5A5A5] [&_path]:stroke-[#A5A5A5] [&_path]:fill-[#A5A5A5]">
                        <ImageIcon />
                      </div>

                      <div className="flex flex-col items-center gap-[7px]">
                        <p className="m-0 font-roboto text-[12px] leading-[14px] text-[#A5A5A5] text-center">
                          Recommended:
                        </p>
                        <p className="m-0 font-roboto text-[17px] leading-[20px] text-[#A5A5A5] text-center">
                          {RECOMMENDED[idx] ?? "Image"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hover description overlay */}
                  <div
                    className="
                      pointer-events-none
                      absolute bottom-0 left-0 right-0
                      h-[70px]
                      px-[15px] pt-[12px] pb-[10px]
                      flex flex-col justify-end items-start
                      opacity-0 group-hover:opacity-100
                      transition-opacity
                      rounded-b-[15px]
                      z-[2]
                    "
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 70%, #FFFFFF 100%)",
                      backdropFilter: "none",
                    }}
                  >
                    <p className="m-0 w-full font-inter font-normal text-[17px] leading-[140%] text-[#262626]">
                      {cell.title ?? "Title"}
                    </p>
                    <p className="m-0 w-full font-inter font-normal text-[15px] leading-[140%] text-[#262626]">
                      {cell.description ?? "Short description"}
                    </p>
                  </div>

                  {isDragOver && (
                    <div className="pointer-events-none absolute inset-0 z-[4] bg-white/20 rounded-[15px]" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Previous Vends */}
        <div className="w-[1512px] flex flex-col items-center pt-[20px] pb-[30px] gap-[6px]">
          <p className="m-0 font-inter font-normal text-[13px] leading-[16px] text-center text-[#A5A5A5]">
            {previousVendsLabel}
          </p>

          <div className="flex items-center justify-center gap-[6px]">
            {parsedPrevVends.map((ev, i) => (
              <div key={`${ev.title}-${ev.year ?? ""}-${i}`} className="flex items-baseline gap-[6px]">
                {i !== 0 ? (
                  <span className="font-inter font-normal text-[16px] leading-[19px] text-[#A5A5A5]">|</span>
                ) : null}

                <span className="font-inter font-normal text-[16px] leading-[19px] text-[#262626]">
                  {ev.title || ""}
                </span>

                {ev.year ? (
                  <span className="font-inter italic font-normal text-[12px] leading-[140%] text-[#A5A5A5]">
                    {ev.year}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {localPrevVends.length < 4 ? (
            <input
              ref={addInputRef}
              value={newVend}
              onChange={(e) => setNewVend(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addVend(newVend)
                }
              }}
              placeholder={vendPlaceholder}
              className="
                w-[258px]
                text-center
                font-inter font-normal
                text-[16px] leading-[19px]
                text-[#D3D3D3]
                placeholder:text-[#D3D3D3]
                bg-transparent
                outline-none
              "
            />
          ) : null}
        </div>

        <div className="h-[18px]" />
      </div>
    </section>
  )
}