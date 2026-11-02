"use client"

import { useRef, useState, type ReactNode } from "react"
import { Eye, EyeOff, Pencil, X } from "lucide-react"

type FieldProps = {
    children: ReactNode
    label: string
    editable: boolean
    visible?: boolean
    onVisibilityChange?: (visible: boolean) => void
}

export function PortfolioField({ children, label, editable, visible = true, onVisibilityChange }: FieldProps) {
    const fieldRef = useRef<HTMLDivElement>(null)
    if (!editable) return visible ? <>{children}</> : null

    return (
        <div ref={fieldRef} className={`group/field relative w-full min-w-0 ${onVisibilityChange ? "pr-[48px]" : "pr-[24px]"}`}>
            <div className={visible ? "" : "opacity-40"}>{children}</div>
            <div className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-[6px] opacity-0 pointer-events-none transition-opacity group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto">
                <button type="button" aria-label={`Edit ${label}`} title={`Edit ${label}`} className="flex h-[20px] w-[20px] items-center justify-center text-black/40 focus-visible:outline-2" onClick={() => {
                    const input = fieldRef.current?.querySelector("input")
                    input?.focus()
                    input?.select()
                }}><Pencil size={16} strokeWidth={1.5} /></button>
                {onVisibilityChange && (
                    <button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label} on portfolio`} title={`${visible ? "Hide" : "Show"} on portfolio`} aria-pressed={!visible} onClick={() => onVisibilityChange(!visible)} className="flex h-[20px] w-[20px] items-center justify-center text-black/40 focus-visible:outline-2">
                        {visible ? <Eye size={17} strokeWidth={1.5} /> : <EyeOff size={17} strokeWidth={1.5} />}
                    </button>
                )}
            </div>
        </div>
    )
}

export function PreviousVend({ value, editable, onChange, onDelete, textClassName = "text-[#262626]" }: {
    value: string
    editable: boolean
    onChange: (value: string) => void
    onDelete: () => void
    textClassName?: string
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const match = value.match(/^(.*?)\s+(\d{4})$/)
    function save() {
        const next = draft.trim()
        if (next) onChange(next)
        setEditing(false)
    }
    return (
        <div className={`group/vend relative flex w-full items-center justify-center ${editable ? "pr-[48px]" : ""}`}>
            {editing ? (
                <input autoFocus aria-label="Previous vend" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save} onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); save() }
                    if (e.key === "Escape") { e.preventDefault(); setEditing(false) }
                }} className={`w-full bg-transparent text-center text-[15px] outline-none border-b border-black/40 ${textClassName}`} />
            ) : (
                <span className={`inline-flex items-baseline gap-[6px] text-[15px] leading-[140%] ${textClassName}`}>
                    <span>{match ? match[1] : value}</span>
                    {match && <span className="text-[12px] text-[#A5A5A5]">{match[2]}</span>}
                </span>
            )}
            {editable && !editing && (
                <div className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-[6px] opacity-0 pointer-events-none transition-opacity group-hover/vend:opacity-100 group-hover/vend:pointer-events-auto group-focus-within/vend:opacity-100 group-focus-within/vend:pointer-events-auto">
                    <button type="button" aria-label={`Edit ${value}`} onClick={() => { setDraft(value); setEditing(true) }} className="flex h-[20px] w-[20px] items-center justify-center text-black/40"><Pencil size={16} strokeWidth={1.5} /></button>
                    <button type="button" aria-label={`Remove ${value}`} onClick={onDelete} className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-black/40 text-white"><X size={15} strokeWidth={1.5} /></button>
                </div>
            )}
        </div>
    )
}
