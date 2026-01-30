"use client"

import CheckIcon from "@/components/icons/CheckIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"
import ErrorIcon from "@/components/icons/ErrorIcon"

type Props = {
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder: string
  isValid: boolean
  onRemove: () => void
}

export default function RemovableLinkInput({
  icon,
  value,
  onChange,
  placeholder,
  isValid,
  onRemove,
}: Props) {
  return (
    <div className="w-[426px] h-[40px] flex items-center gap-[13px]">
      {/* Media icon */}
      <div className="w-[24px] h-[24px] flex items-center justify-center">
        {icon}
      </div>

      {/* Input */}
      <div className="relative w-[360px] h-[40px]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-full
            px-[10px] pr-[40px]
            border border-[#A5A5A5]/50
            rounded-[8px]
            bg-white
            font-inter text-[12px] leading-[140%]
            text-[#262626]
            placeholder:text-[#A5A5A5]
            outline-none
          "
        />

        {/* Validation icon (inside input) */}
        {value.length > 0 && (
          <div className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center">
            {isValid ? (
              <div className="w-[20px] h-[20px] flex items-center justify-center scale-[1.25]">
                <CheckIcon className="[&_path]:stroke-[#00CF07]" />
              </div>
            ) : (
              <div className="w-[20px] h-[20px] flex items-center justify-center scale-[1.15]">
                <ErrorIcon />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onRemove}
        className="w-[16px] h-[16px] flex items-center justify-center"
      >
        <div className="w-[16px] h-[16px] flex items-center justify-center scale-[2]">
          <DeleteIcon className="[&_path]:stroke-[#A5A5A5]" />
        </div>
      </button>
    </div>
  )
}
