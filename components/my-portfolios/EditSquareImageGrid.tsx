"use client"

import { useEffect, useRef, useState } from "react"
import ImageIcon from "@/components/icons/ImageIcon"
import SlidersIcon from "@/components/icons/SlidersIcon"

type Cell = {
  id: string
  src?: string
  title?: string
  description?: string
}

type Props = {
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

function makeDefaultCells(): Cell[] {
  return Array.from({ length: 9 }).map((_, i) => ({
    id: String(i),
    src: "",
    title: "Title",
    description: "Short description",
  }))
}

export default function EditSquareImageGrid({ images, onChangeImages }: Props) {
  const [cells, setCells] = useState<Cell[]>(() => {
    const incoming = images?.slice(0, 9)
    return incoming && incoming.length > 0
      ? incoming.concat(makeDefaultCells()).slice(0, 9)
      : makeDefaultCells()
  })

  useEffect(() => {
    if (!images) return
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

  const updateCells = (updater: (prev: Cell[]) => Cell[]) => {
    setCells((prev) => {
      const next = updater(prev)
      onChangeImages?.(next)
      return next
    })
  }

  const openFilePicker = (idx: number) => {
    inputsRef.current[idx]?.click()
  }

  const setImageFromFile = (idx: number, file: File) => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)

    updateCells((prev) => {
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        src: url,
        title: next[idx]?.title ?? "Title",
        description: next[idx]?.description ?? "Short description",
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
    <section className="w-[922px] h-[982px] flex flex-col items-center justify-center py-[30px]">
      <div className="w-[922px] h-[922px]">
        <div className="w-full h-full grid grid-cols-3 gap-[15px]">
          {cells.map((cell, idx) => {
            const hasImage = Boolean(cell.src)
            const isDragOver = dragOverIdx === idx

            return (
              <div
                key={cell.id ?? String(idx)}
                className={`
                  group
                  relative
                  rounded-[15px]
                  overflow-hidden
                  bg-[rgba(165,165,165,0.068)]
                  shadow-[2px_4px_25px_rgba(165,165,165,0.1),
                          inset_2.14645px_2.00046px_9.24px_rgba(165,165,165,0.126),
                          inset_1.21725px_1.13446px_4.62px_rgba(165,165,165,0.126)]
                  border border-white
                  transition
                  ${isDragOver ? "border-dashed" : ""}
                `}
                style={{
                  // subtle "glowy/gradient-ish" border feel 
                  boxShadow:
                    "2px 4px 25px rgba(165,165,165,0.1), inset 2.14645px 2.00046px 9.24px rgba(165,165,165,0.126), inset 1.21725px 1.13446px 4.62px rgba(165,165,165,0.126), inset 0 0 0 1px rgba(255,255,255,0.9)",
                }}
                onDragOver={(e) => onDragOver(idx, e)}
                onDragLeave={(e) => onDragLeave(idx, e)}
                onDrop={(e) => onDrop(idx, e)}
              >
                {/* Hidden input per cell */}
                <input
                  ref={(el) => {
                    inputsRef.current[idx] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onInputChange(idx, e)}
                />

                {/* Click target: opens file picker */}
                <button
                  type="button"
                  className="absolute inset-0"
                  aria-label={`Upload image ${idx + 1}`}
                  onClick={() => openFilePicker(idx)}
                >
                  <span className="sr-only">Upload</span>
                </button>

                {/* Sliders icon (hover only) */}
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
                    z-[3]
                  "
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <SlidersIcon />
                </button>

                {/* Image preview */}
                {hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cell.src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                ) : null}

                {/* "Recommended" content */}
                {!hasImage && (
                  <div
                    className="
                      pointer-events-none
                      absolute inset-0
                      flex flex-col items-center justify-center
                      gap-[5px]
                      z-[1]
                    "
                  >
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

                {/* Hover description overlay */}
                <div
                  className="
                    pointer-events-none
                    absolute bottom-0 left-0 right-0
                    h-[70px]
                    px-[15px] pt-[12px] pb-[10px]
                    flex flex-col justify-end items-start 
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.9)_70%,#FFFFFF_100%)]
                    backdrop-blur-[3px]
                    rounded-b-[15px]
                    z-[2]
                  "
                >
                  {/* Title */}
                  <p className="m-0 w-full font-inter font-normal text-[17px] leading-[140%] text-[#262626]">
                    {cell.title ?? "Title"}
                  </p>

                  {/* Short description */}
                  <p className="m-0 w-full font-inter font-normal text-[15px] leading-[140%] text-[#262626]">
                    {cell.description ?? "Short description"}
                  </p>
                </div>

                {/* Drag-over hint overlay (subtle) */}
                {isDragOver && (
                  <div className="pointer-events-none absolute inset-0 z-[4] bg-white/20" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
