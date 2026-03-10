// components/my-portfolios/square/EditSquareImageGrid.tsx
"use client"

import { useEffect, useRef, useState } from "react"
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
  editable?: boolean
  images?: Cell[]
  onChangeImages?: (images: Cell[]) => void
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
  "Your Product",
]

const DEFAULT_EDITS: ImageEdits = {
  rotate: 50,
  zoom: 0,
  brightness: 50,
  contrast: 50,
  saturation: 50,
  temperature: 50,
}

function makeDefaultCells(): Cell[] {
  return Array.from({ length: 9 }).map((_, i) => ({
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

export default function EditSquareImageGrid({ editable = true, images, onChangeImages }: Props) {
  const [cells, setCells] = useState<Cell[]>(() => {
    const incoming = images?.slice(0, 9)
    return incoming && incoming.length > 0
      ? incoming.concat(makeDefaultCells()).slice(0, 9)
      : makeDefaultCells()
  })

  const syncingFromPropsRef = useRef(false)
  useEffect(() => {
    if (!images) return
    syncingFromPropsRef.current = true

    const incoming = images.slice(0, 9)
    const next =
      incoming.length > 0
        ? incoming.concat(makeDefaultCells()).slice(0, 9)
        : makeDefaultCells()
    setCells(next)
  }, [images])

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

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
    if (!editable) {
      pendingEmitRef.current = null
      return
    }

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
  }, [cells, onChangeImages, editable])

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

  const [openEditorIdx, setOpenEditorIdx] = useState<number | null>(null)

  useEffect(() => {
    if (editable) return
    setOpenEditorIdx(null)
  }, [editable])

  return (
    <section className="w-[922px] h-[982px] flex flex-col items-center justify-center py-[30px]">
      <div className="w-[922px] h-[922px]">
        <div className="w-full h-full grid grid-cols-3 gap-[15px]">
          {cells.map((cell, idx) => {
            const hasImage = Boolean(cell.src)
            const isDragOver = dragOverIdx === idx
            const isEditorOpen = openEditorIdx === idx

            const col = idx % 3
            const placement: "right" | "left" = col === 2 ? "left" : "right"

            const imgStyle = editsToImgStyle(cell.edits)

            return (
              <div
                key={cell.id ?? String(idx)}
                className="group relative rounded-[15px] overflow-visible"
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
                  className="
                    relative
                    w-full h-full
                    rounded-[15px]
                    overflow-hidden
                    bg-[rgba(165,165,165,0.068)]
                    backdrop-blur-[7.58px]
                  "
                  style={{
                    boxShadow: [
                      "0 0 0 1.25px rgba(255,255,255,0.95)",
                      "0 0 18px rgba(255,255,255,0.55)",
                      "0 0 40px rgba(255,255,255,0.25)",
                      "2px 4px 25px rgba(165, 165, 165, 0.10)",
                      "inset 2.14645px 2.00046px 9.24px rgba(165, 165, 165, 0.126)",
                      "inset 1.21725px 1.13446px 4.62px rgba(165, 165, 165, 0.126)",
                      "inset 0 0 0 2px rgba(255,255,255,0.88)",
                    ].join(", "),
                  }}
                >
                  {/* Click target (edit only) */}
                  {editable ? (
                    <button
                      type="button"
                      className="absolute inset-0 z-[0] bg-transparent cursor-pointer"
                      aria-label={`Upload image ${idx + 1}`}
                      onClick={() => {
                        if (isEditorOpen) return
                        openFilePicker(idx)
                      }}
                    >
                      <span className="sr-only">Upload</span>
                    </button>
                  ) : (
                    <div className="absolute inset-0 z-[0]" />
                  )}

                  {/* Image preview */}
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cell.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]"
                      style={{
                        ...imgStyle,
                        transform: `${imgStyle.transform} scale(1.02)`,
                        transformOrigin: "center",
                      }}
                      draggable={false}
                    />
                  ) : null}

                  {/* Recommended content */}
                  {!hasImage && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[5px] z-[2]">
                      <div className="w-[52px] h-[52px] flex items-center justify-center text-[#A5A5A5] [&_path]:stroke-[#A5A5A5] [&_path]:fill-[#A5A5A5]">
                        <ImageIcon />
                      </div>

                      <div className="flex flex-col items-center gap-[7px]">
                        <p className="m-0 font-roboto text-[12px] leading-[14px] text-[#A5A5A5] text-center">
                          Recommended:
                        </p>

                        <p className="m-0 font-roboto text-[17px] leading-[20px] text-[#A5A5A5] text-center">
                          {RECOMMENDED[idx]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay (both modes) */}
                  <div className="pointer-events-none absolute left-0 right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity z-[3]">
                    <div
                      className="absolute left-[-2px] right-[-2px] bottom-[-2px]"
                      style={{
                        height: 76,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 70%, rgba(255,255,255,1) 100%)",
                      }}
                    />

                    <div
                      className="absolute left-0 right-0 bottom-0"
                      style={{
                        height: 72,
                        borderBottomLeftRadius: 15,
                        borderBottomRightRadius: 15,
                        boxShadow: "inset 0 -2px 0 rgba(255,255,255,0.88)",
                      }}
                    />

                    <div className="absolute left-0 right-0 bottom-0 h-[70px] px-[15px] py-[15px] flex flex-col justify-end items-start">
                      <p className="m-0 w-full font-inter font-normal text-[17px] leading-[140%] text-[#262626]">
                        {cell.title ?? "Title"}
                      </p>
                      <p className="m-0 w-full font-inter font-normal text-[15px] leading-[150%] text-[#262626]">
                        {cell.description ?? "Short description"}
                      </p>
                    </div>
                  </div>

                  {editable && isDragOver ? (
                    <div className="pointer-events-none absolute inset-0 z-[4] bg-white/20" />
                  ) : null}
                </div>

                {/* Sliders icon + popover (edit only) */}
                {editable ? (
                  <>
                    <button
                      type="button"
                      aria-label="Image settings"
                      className="
                        absolute
                        right-[10px] top-[10px]
                        hidden
                        w-[24px] h-[24px]
                        group-hover:flex
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

                    {isEditorOpen && (
                      <EditImagePopover
                        title={`Recommended - ${RECOMMENDED[idx]}`}
                        imageSrc={cell.src}
                        onClose={() => setOpenEditorIdx(null)}
                        placement={placement}
                        variant="square"
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
    </section>
  )
}