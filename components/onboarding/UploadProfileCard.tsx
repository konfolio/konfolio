"use client"

import { useRef, useState } from "react"
import ArrowLeft from "@/components/icons/ArrowLeft"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ImageIcon from "@/components/icons/ImageIcon"

type Props = {
  backHref: string
  nextHref: string
  title?: string // default: "Last step!"
  displayName: string // org name or business name
  locationText: string
}

export default function UploadProfileCard({
  backHref,
  nextHref,
  title = "Last step!",
  displayName,
  locationText,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [dragOver, setDragOver] = useState(false)

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFile(f: File | null) {
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    handleFile(f)
  }

  function onDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0] ?? null
    handleFile(f)
  }

  const canContinue = Boolean(file)

  return (
    <div
      className="
        relative
        w-[914px] h-[619px]
        flex flex-col justify-between items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Back Arrow */}
      <ArrowLeft href={backHref} className="absolute left-[45px] top-[50px]" />

      {/* Header row */}
      <div className="w-full flex justify-center">
        <div className="relative w-[824px] h-[18px] flex items-start justify-center">
          <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
            {title}
          </p>
        </div>
      </div>

      {/* Middle block (Frame 131) */}
      <div className="w-[480px] h-[268px] flex flex-col items-center gap-[30px]">
        {/* Profile Picture dropzone */}
        <button
            type="button"
            onClick={openFilePicker}
            onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`
                relative
                block
                w-[193px] h-[193px]
                min-w-[193px] min-h-[193px]
                max-w-[193px] max-h-[193px]
                shrink-0
                overflow-hidden
                rounded-full
                bg-white
                border border-[#A5A5A5]/50
                shadow-[4px_4px_15px_rgba(0,0,0,0.1)]
                ${dragOver ? "ring-2 ring-[#A5A5A5]/50" : ""}
            `}
            >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onInputChange}
            />

            {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                src={previewUrl}
                alt="Profile preview"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]">
                <div className="w-[52px] h-[52px] flex items-center justify-center">
                    <ImageIcon className="w-[39px] h-[39px] text-[#A5A5A5]" />
                </div>
                <p className="m-0 w-[110px] text-center font-inter font-normal text-[11px] leading-[13px] text-[#A5A5A5]">
                    Drop image here or click
                    <br />
                    to open files
                </p>
                </div>
            )}
        </button>

        {/* Name + location */}
        <div className="w-[480px] max-w-[480px] flex flex-col items-center gap-[15px]">
          <p className="m-0 w-full text-center font-inter font-normal text-[25px] leading-[30px] text-black">
            {displayName}
          </p>
          <p className="m-0 w-full text-center font-inter font-normal text-[16px] leading-[19px] text-[#A5A5A5]">
            {locationText}
          </p>
        </div>
      </div>

      {/* Finish */}
      <PrimaryButton
        href={canContinue ? nextHref : "#"}
        className={!canContinue ? "pointer-events-none opacity-40" : ""}
        icon="none"
      >
        Finish
      </PrimaryButton>
    </div>
  )
}
