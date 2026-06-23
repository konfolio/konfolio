// components/my-portfolios/portrait/EditPortraitImageGrid.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ImageIcon from "@/components/icons/ImageIcon"
import SlidersIcon from "@/components/icons/SlidersIcon"
import PencilIcon from "@/components/icons/PencilIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import EditImagePopover, { type ImageEdits } from "@/components/my-portfolios/EditImagePopover"

type Cell = {
  id: string
  src?: string
  title?: string
  description?: string
  edits?: ImageEdits
}

type Props = {
  editable?: boolean
  backgroundIsDark?: boolean

  images?: Cell[]
  onChangeImages?: (images: Cell[]) => void

  previousVendsLabel?: string
  previousVends?: string[]
  onChangePreviousVends?: (vals: string[]) => void
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

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

export default function EditPortraitImageGrid({
  editable = true,
  backgroundIsDark = false,

  images,
  onChangeImages,
  previousVendsLabel = "Previous Vends",
  previousVends = [],
  onChangePreviousVends,
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

  const [localPrevVends, setLocalPrevVends] = useState<string[]>([])
  const [newVend, setNewVend] = useState("")
  const addInputRef = useRef<HTMLInputElement | null>(null)

  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const editInputRef = useRef<HTMLInputElement | null>(null)

  const lastSyncedPrevRef = useRef<string[]>([])

  useEffect(() => {
    const nextLocal = (previousVends ?? [])
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .slice(0, 4)

    if (arraysEqual(nextLocal, lastSyncedPrevRef.current)) return
    lastSyncedPrevRef.current = nextLocal

    setLocalPrevVends(nextLocal)
    setEditingIdx(null)
    setEditingValue("")
  }, [previousVends])

  useEffect(() => {
    if (!editable) return
    if (editingIdx === null) return
    window.setTimeout(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }, 0)
  }, [editingIdx, editable])

  const hasAnyEvents = localPrevVends.length > 0
  const vendPlaceholder = hasAnyEvents ? "Type an event..." : "Vended Event 2026"

  const emitPrevVends = (next: string[]) => {
    const normalized = next.map((s) => (s || "").trim()).filter(Boolean).slice(0, 4)
    onChangePreviousVends?.(normalized)
    lastSyncedPrevRef.current = normalized
  }

  const addVend = (raw: string) => {
    if (!editable) return
    const text = (raw || "").trim()
    if (!text) return
    if (localPrevVends.length >= 4) return

    const next = [...localPrevVends, text].slice(0, 4)
    setLocalPrevVends(next)
    emitPrevVends(next)

    setNewVend("")
    addInputRef.current?.focus()
  }

  const startEditVend = (idx: number) => {
    if (!editable) return
    const cur = (localPrevVends[idx] ?? "").trim()
    setEditingIdx(idx)
    setEditingValue(cur)
  }

  const saveEditVend = () => {
    if (!editable) return
    if (editingIdx === null) return
    const nextText = (editingValue || "").trim()

    const next = [...localPrevVends]
    if (!nextText) next.splice(editingIdx, 1)
    else next[editingIdx] = nextText

    const normalized = next.slice(0, 4)
    setLocalPrevVends(normalized)
    emitPrevVends(normalized)

    setEditingIdx(null)
    setEditingValue("")
  }

  const cancelEditVend = () => {
    if (!editable) return
    setEditingIdx(null)
    setEditingValue("")
  }

  const deleteVend = (idx: number) => {
    if (!editable) return
    const next = [...localPrevVends]
    next.splice(idx, 1)

    const normalized = next.slice(0, 4)
    setLocalPrevVends(normalized)
    emitPrevVends(normalized)

    if (editingIdx === idx) cancelEditVend()
  }

  const parsedPrevVends = useMemo(() => localPrevVends.map(parseEventLine), [localPrevVends])

  const objectUrls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u))
      objectUrls.current = []
    }
  }, [])

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

  useEffect(() => {
    if (editable) return
    setOpenEditorIdx(null)
  }, [editable])

  const openFilePicker = (idx: number) => {
    if (!editable) return
    inputsRef.current[idx]?.click()
  }

  const setImageFromFile = (idx: number, file: File) => {
    if (!editable) return
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
    if (!editable) return
    const file = e.target.files?.[0]
    if (!file) return
    setImageFromFile(idx, file)
    e.target.value = ""
  }

  const onDragOver = (idx: number, e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx(idx)
  }

  const onDragLeave = (idx: number, e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx((cur) => (cur === idx ? null : cur))
  }

  const onDrop = (idx: number, e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx(null)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setImageFromFile(idx, file)
  }

  const showPrevVendsSection = editable || localPrevVends.length > 0

  const cardShellClass = backgroundIsDark
    ? "border-0 bg-[rgba(165,165,165,0.068)] backdrop-blur-[7.58px]"
    : "border-0 min-[851px]:border min-[851px]:border-white bg-[rgba(165,165,165,0.068)] backdrop-blur-[7.58px]"

  const cardShellStyle: React.CSSProperties = backgroundIsDark
    ? {
        boxShadow: "2px 4px 25px rgba(0,0,0,0.12)",
      }
    : {
        boxShadow:
          "2px 4px 25px rgba(165,165,165,0.1), inset 2.14645px 2.00046px 9.24px rgba(165,165,165,0.126), inset 1.21725px 1.13446px 4.62px rgba(165,165,165,0.126), inset 0 0 0 1px rgba(255,255,255,0.9)",
      }

  const gradientStyle: React.CSSProperties = backgroundIsDark
    ? {
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.76) 70%, #000000 100%)",
        backdropFilter: "none",
      }
    : {
        background:
          "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 70%, #FFFFFF 100%)",
        backdropFilter: "none",
      }

  const overlayTextClass = backgroundIsDark ? "text-white" : "text-[#262626]"
  const prevVendTextClass = backgroundIsDark ? "text-white" : "text-[#262626]"

  return (
    <section
      className="
        mx-auto
        flex
        w-full
        flex-col
        items-center
        justify-center
        px-0
        py-0
        min-[851px]:py-[30px]
      "
    >
      <div className="w-full min-w-[600px] max-w-[1182px] max-[850px]:min-w-0">
        <div className="grid w-full grid-cols-1 gap-0 overflow-visible min-[851px]:grid-cols-4 min-[851px]:gap-[15px]">
          {cells.map((cell, idx) => {
            const hasImage = Boolean(cell.src)
            const isDragOver = dragOverIdx === idx
            const isEditorOpen = openEditorIdx === idx

            const col = idx % 4
            const placement: "right" | "left" = col === 3 ? "left" : "right"

            const imgStyle = editsToImgStyle(cell.edits)

            return (
              <div
                key={cell.id ?? String(idx)}
                className={`
                  group relative
                  aspect-[274/345]
                  w-full
                  overflow-visible
                  rounded-none min-[851px]:rounded-[15px]
                  transition
                  ${isEditorOpen ? "z-[200]" : "z-[0]"}
                `}
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

                <div
                  className={[
                    "relative h-full w-full overflow-hidden rounded-none min-[851px]:rounded-[15px]",
                    cardShellClass,
                  ].join(" ")}
                  style={cardShellStyle}
                >
                  <button
                    type="button"
                    className={[
                      "absolute inset-0 z-[0] bg-transparent",
                      editable ? "cursor-pointer" : "cursor-default",
                    ].join(" ")}
                    aria-label={`Upload image ${idx + 1}`}
                    onClick={() => {
                      if (!editable) return
                      if (isEditorOpen) return
                      openFilePicker(idx)
                    }}
                  />

                  {hasImage ? (
                    <img
                      src={cell.src}
                      alt=""
                      className="absolute inset-0 z-[1] h-full w-full object-cover pointer-events-none"
                      style={imgStyle}
                      draggable={false}
                    />
                  ) : null}

                  {!hasImage && (
                    <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[5px]">
                      <div className="flex h-[52px] w-[52px] items-center justify-center text-[#A5A5A5] [&_path]:fill-[#A5A5A5] [&_path]:stroke-[#A5A5A5]">
                        <ImageIcon />
                      </div>

                      <div className="flex flex-col items-center gap-[7px]">
                        <p className="m-0 text-center font-roboto text-[12px] leading-[14px] text-[#A5A5A5]">
                          Recommended:
                        </p>
                        <p className="m-0 text-center font-roboto text-[17px] leading-[20px] text-[#A5A5A5]">
                          {RECOMMENDED[idx] ?? "Image"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    className="
                      pointer-events-none
                      absolute bottom-0 left-0 right-0
                      z-[2]
                      flex h-[70px] flex-col items-start justify-end
                      px-[15px] pb-[10px] pt-[12px]
                      opacity-100 min-[851px]:opacity-0 min-[851px]:group-hover:opacity-100
                      transition-opacity
                    "
                    style={gradientStyle}
                  >
                    <p className={`m-0 w-full font-inter text-[17px] font-normal leading-[140%] ${overlayTextClass}`}>
                      {cell.title ?? "Title"}
                    </p>
                    <p className={`m-0 w-full font-inter text-[15px] font-normal leading-[140%] ${overlayTextClass}`}>
                      {cell.description ?? "Short description"}
                    </p>
                  </div>

                  {editable && isDragOver && (
                    <div className="pointer-events-none absolute inset-0 z-[4] bg-white/20" />
                  )}
                </div>

                {editable ? (
                  <>
                    <button
                      type="button"
                      aria-label="Image settings"
                      className="
                        absolute right-[10px] top-[10px]
                        z-[10]
                        hidden
                        h-[24px] w-[24px]
                        cursor-pointer
                        items-center justify-center
                        min-[851px]:group-hover:flex
                      "
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenEditorIdx((cur) => (cur === idx ? null : idx))
                      }}
                    >
                      <SlidersIcon />
                    </button>

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
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {showPrevVendsSection ? (
        <div className="hidden w-full flex-col items-center gap-[6px] px-2 pt-[20px] min-[851px]:flex">
          <p className="m-0 text-center font-inter text-[13px] font-normal leading-[16px] text-[#A5A5A5]">
            {previousVendsLabel}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[4px]">
            {parsedPrevVends.map((ev, i) => {
              const isEditing = editable && editingIdx === i
              const displayKey = `${ev.title}-${ev.year ?? ""}-${i}`

              return (
                <div key={displayKey} className="group flex items-center gap-[6px]">
                  {i !== 0 ? (
                    <span className="font-inter text-[16px] font-normal leading-[19px] text-[#A5A5A5]">
                      |
                    </span>
                  ) : null}

                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          saveEditVend()
                        }
                        if (e.key === "Escape") {
                          e.preventDefault()
                          cancelEditVend()
                        }
                      }}
                      className={`
                        w-[240px]
                        bg-transparent
                        text-center
                        font-inter
                        text-[16px] font-normal leading-[19px]
                        outline-none
                        ${prevVendTextClass}
                      `}
                      aria-label="Edit previous vend"
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditVend(i)}
                        className={["flex items-baseline gap-[6px]", editable ? "cursor-text" : "cursor-default"].join(
                          " "
                        )}
                        aria-label="Edit previous vend"
                      >
                        <span className={`font-inter text-[16px] font-normal leading-[19px] ${prevVendTextClass}`}>
                          {ev.title || ""}
                        </span>

                        {ev.year ? (
                          <span className="font-inter text-[12px] font-normal italic leading-[140%] text-[#A5A5A5]">
                            {ev.year}
                          </span>
                        ) : null}
                      </button>

                      {editable ? (
                        <span
                          className="
                            ml-[4px]
                            flex items-center gap-[6px]
                            opacity-0
                            pointer-events-none
                            transition-opacity
                            group-hover:opacity-100 group-hover:pointer-events-auto
                          "
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditVend(i)
                            }}
                            aria-label="Edit previous vend"
                            className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center text-[#A5A5A5]"
                          >
                            <PencilIcon className="h-[16px] w-[16px]" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteVend(i)
                            }}
                            aria-label="Delete previous vend"
                            className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center text-[#A5A5A5]"
                          >
                            <TrashIcon className="h-[16px] w-[16px]" />
                          </button>
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {editable && localPrevVends.length < 4 ? (
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
                w-full max-w-[258px]
                bg-transparent
                text-center
                font-inter
                text-[16px] font-normal leading-[19px]
                text-[#D3D3D3]
                placeholder:text-[#D3D3D3]
                outline-none
              "
            />
          ) : null}
        </div>
      ) : null}

      
    </section>
  )
}