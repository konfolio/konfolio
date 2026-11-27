"use client"

import { useId, useState, type ReactNode } from "react"
import { Check, X } from "lucide-react"
import ArrowDown from "@/components/icons/ArrowDown"

const FOCUS_RING =
  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#262626]"

/* ---------- Checkbox ---------- */
export function Checkbox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <label className={`relative flex items-center gap-[5px] ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        aria-hidden="true"
        className={[
          "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[3px] border transition-colors",
          FOCUS_RING,
          checked
            ? disabled
              ? "border-[#C4C4C4] bg-[#C4C4C4]"
              : "border-[#262626] bg-[#262626]"
            : "border-[#A5A5A5] bg-white",
        ].join(" ")}
      >
        {checked ? <Check className="h-[12px] w-[12px] text-white" strokeWidth={2.5} /> : null}
      </span>
      <span className={`font-inter text-[15px] leading-[140%] ${disabled ? "text-black/30" : "text-[#262626]"}`}>
        {label}
      </span>
    </label>
  )
}

/* ---------- Radio ---------- */
export function Radio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="relative flex cursor-pointer items-center gap-[10px]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border border-[#262626] ${FOCUS_RING}`}
      >
        {checked ? <span className="h-[10px] w-[10px] rounded-full bg-[#262626]" /> : null}
      </span>
      <span className="font-inter text-[17px] leading-[140%] text-[#262626]">{label}</span>
    </label>
  )
}

/* ---------- Select ---------- */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-[10px]">
      <label htmlFor={id} className="font-inter text-[17px] leading-[140%] text-[#262626]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-[40px] w-full cursor-pointer appearance-none rounded-[8px] border border-[#D3D3D3] bg-white pl-[15px] pr-[40px] font-inter text-[17px] text-[#262626] outline-none transition-colors focus-visible:border-[#262626]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[15px] top-1/2 flex -translate-y-1/2 text-[#A5A5A5] [&_path]:stroke-[#A5A5A5]"
        >
          <ArrowDown className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

/* ---------- Number chips ---------- */
function chipClass(selected: boolean, disabled: boolean) {
  const base =
    "flex h-[30px] w-[30px] items-center justify-center rounded-[10px] border font-inter text-[17px] leading-none transition-colors"
  if (selected) return `${base} border-[#262626] bg-[#262626] text-white`
  if (disabled) return `${base} cursor-not-allowed border-[#E5E5E5] text-[#D3D3D3]`
  return `${base} cursor-pointer border-[#262626] text-[#262626] hover:bg-black/5`
}

export function ChipGroup({
  label,
  options,
  value,
  isDisabled,
  onChange,
}: {
  label: string
  options: number[]
  value: number
  isDisabled?: (n: number) => boolean
  onChange: (n: number) => void
}) {
  const labelId = useId()
  return (
    <div className="flex items-center">
      <span id={labelId} className="w-[91px] shrink-0 font-inter text-[17px] leading-[140%] text-[#262626]">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex gap-[14px]">
        {options.map((n) => {
          const selected = n === value
          const disabled = !selected && Boolean(isDisabled?.(n))
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(n)}
              className={chipClass(selected, disabled)}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Accordion ---------- */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="rounded-[10px] border border-[#E5E5E5] bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between px-[11px] py-[6px] text-left"
      >
        <span className="font-inter text-[15px] leading-[140%] text-[#262626]">{title}</span>
        <span
          aria-hidden="true"
          className={`flex text-[#A5A5A5] transition-transform [&_path]:stroke-[#A5A5A5] ${open ? "rotate-180" : ""}`}
        >
          <ArrowDown className="h-4 w-4" />
        </span>
      </button>
      {open ? (
        <div id={panelId} className="px-[11px] pb-[10px]">
          {children}
        </div>
      ) : null}
    </div>
  )
}

/* ---------- Text field with status ---------- */
export type FieldStatus = "hint" | "checking" | "available" | "taken" | "required"

const STATUS_COPY: Record<Exclude<FieldStatus, "hint">, string> = {
  checking: "Checking…",
  available: "Available",
  taken: "Already Taken",
  required: "Required Field",
}

const STATUS_COLOR: Record<FieldStatus, string> = {
  hint: "text-black/40",
  checking: "text-black/40",
  available: "text-[#14B814]",
  taken: "text-[#FF4603]",
  required: "text-[#FF4603]",
}

export function StatusTextField({
  id,
  label,
  value,
  onChange,
  status,
  hint,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  status: FieldStatus
  hint: string
  placeholder?: string
}) {
  const helpId = `${id}-help`
  const invalid = status === "taken" || status === "required"

  return (
    <div className="flex flex-col gap-[4px]">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={helpId}
        autoComplete="off"
        spellCheck={false}
        className="h-[40px] w-full rounded-[10px] border border-[#D3D3D3] bg-white px-[15px] font-inter text-[17px] text-[#262626] outline-none transition-colors focus:border-[#262626]"
      />
      <p
        id={helpId}
        aria-live="polite"
        className={`m-0 flex items-center gap-[8px] font-inter text-[15px] leading-[140%] ${STATUS_COLOR[status]}`}
      >
        {status === "available" ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
        {status === "taken" ? <X aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
        {status === "hint" ? hint : STATUS_COPY[status]}
      </p>
    </div>
  )
}