"use client"

import { useQuestionDraft, type Mode } from "@/stores/questionDraft"
import CheckIcon from "@/components/icons/CheckIcon"

type FreeResponseProps = {
  label: string
  value: string
  onChange: (v: string) => void
  optional?: boolean
  placeholder?: string
}

type CheckboxResponseProps = {
  label: string
  options: string[]
  onChange: (v: string[]) => void
  checked: boolean[]
  onCheckedChange: (v: boolean[]) => void
  optional?: boolean
  placeholder?: string
  mode: Mode
}

export function ShortResponse({
  label,
  value,
  onChange,
  optional = false,
  placeholder,
}: FreeResponseProps) {
  return (
    
    <div>
        <div className="flex items-center gap-[5px]">
          <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
            {label}
            {!optional && "*"}
          </span>
        </div>

      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-[342px] h-[40px]
          rounded-[8px]
          border border-[#A5A5A5]/50
          bg-white
          px-[16px] py-[12px]
          font-inter text-[15px] leading-[140%] text-[#262626]
          placeholder:text-[#A5A5A5]
          outline-none
          focus:border-[#262626]/60
        "
        />
    </div>
  )
}

export function KonfolioLink({
  label,
  value,
  onChange,
  optional = false,
  placeholder,
}: FreeResponseProps) {
  return (
    
    <div>
        <div className="flex items-center gap-[5px]">
          <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
            {label = 'Konfolio Link'}
            {!optional && "*"}
          </span>
        </div>

      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https//:konfolio.com/"
        className="
          w-[342px] h-[40px]
          rounded-[8px]
          border border-[#A5A5A5]/50
          bg-white
          px-[16px] py-[12px]
          font-inter text-[15px] leading-[140%] text-[#262626]
          placeholder:text-[#A5A5A5]
          outline-none
          focus:border-[#262626]/60
        "
        />
      <span className="font-inter text-[12px] leading-[130%] text-[#262626]">Konfolio does not show preview of external portfolios.</span>
    </div>
  )
}

export function CheckboxResponse({
  label,
  options,
  onChange,
  checked,
  onCheckedChange,
  optional = false,
  placeholder,
  mode,
}: CheckboxResponseProps) {
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    onChange(updated)
  }

  const handleCheckedChange = (index: number, value: boolean) => {
    const updated = [...checked]
    updated[index] = value
    onCheckedChange(updated)
  }

  const addOption = () => {
    onChange([...options, ""])
    onCheckedChange([...checked, false])
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
    onCheckedChange(checked.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center gap-[5px] mb-2">
        <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
          {label}
          {!optional && " *"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Custom checkbox */}
            <span
              className={[
                "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
                checked[index]
                  ? "bg-[#262626]"
                  : "bg-white border border-[#262626]",
              ].join(" ")}
            >
              {checked[index] && (
                <span className="absolute left-[2px] top-[3px]">
                  <CheckIcon className="[&_path]:stroke-white" />
                </span>
              )}
            </span>

            {/* Hidden input */}
            <input
              type="checkbox"
              className="sr-only"
              checked={checked[index]}
              onChange={(e) =>
                handleCheckedChange(index, e.target.checked)
              }
            />

            {/* Option text */}
            <input
              value={opt}
              onChange={(e) =>
                handleOptionChange(index, e.target.value)
              }
              placeholder={placeholder || `Option ${index + 1}`}
              className="flex-1 text-sm"
            />

            {/* Delete (editing only) */}
            {mode === "editing" && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}

        {/* Add (editing only) */}
        {mode === "editing" && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add option
          </button>
        )}
      </div>
    </div>
  )
}