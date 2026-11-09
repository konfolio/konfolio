"use client"

import { useId, useRef, useState } from "react"
import { Check, Link as LinkIcon } from "lucide-react"
import useClickOutside from "@/components/hooks/useClickOutside"
import { normalizePortfolioImageUrl } from "@/lib/portfolioImageLinks"

export function PortfolioImageLinkEditor({ href, label, onChange }: {
    href?: string
    label: string
    onChange: (href: string | undefined) => void
}) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState(href ?? "")
    const [error, setError] = useState("")
    const wrapRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const id = useId()
    const validUrl = normalizePortfolioImageUrl(draft)
    useClickOutside(wrapRef, () => setOpen(false), { enabled: open })

    function save() {
        const normalized = normalizePortfolioImageUrl(draft)
        if (normalized === null) {
            setError("Enter a valid http:// or https:// website URL.")
            return
        }
        onChange(normalized || undefined)
        setOpen(false)
        buttonRef.current?.focus()
    }

    return (
        <div ref={wrapRef} className={`absolute left-[10px] top-[10px] ${open ? "z-[210]" : "z-[20]"}`} onClick={(e) => e.stopPropagation()}>
            <button ref={buttonRef} type="button" aria-label={`${href ? "Edit" : "Add"} link for ${label}`} aria-expanded={open} aria-controls={id}
                className={`flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white/90 text-black/60 shadow-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 ${open || href ? "opacity-100" : "opacity-0"}`}
                onClick={() => { setDraft(href ?? ""); setError(""); setOpen(!open) }}>
                <LinkIcon size={18} strokeWidth={1.5} />
            </button>
            {open && (
                <form id={id} aria-label={`Image link for ${label}`} onSubmit={(e) => { e.preventDefault(); save() }}
                    onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); buttonRef.current?.focus() } }}
                    className="absolute left-0 top-[38px] w-[min(300px,75vw)] max-w-[calc(100vw-48px)] rounded-[20px] bg-white p-[14px] text-[#262626] shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
                    <div aria-hidden="true" className="absolute -top-[6px] left-[8px] h-[12px] w-[12px] rotate-45 bg-white" />
                    <div className="relative flex items-center gap-[10px]">
                        <input autoFocus type="text" inputMode="url" aria-label="Image destination URL" value={draft} placeholder="https://" onChange={(e) => { setDraft(e.target.value); setError("") }} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/40" />
                        <button type="submit" aria-label="Save image link" className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center ${validUrl ? "text-[#00BB00]" : "text-black/40"}`}><Check size={22} /></button>
                    </div>
                    {error && <p role="alert" className="mt-2 text-[12px] text-red-600">{error}</p>}
                    {href && <button type="button" onClick={() => { onChange(undefined); setOpen(false); buttonRef.current?.focus() }} className="mt-3 text-[12px] text-black/40 underline">Remove link</button>}
                </form>
            )}
        </div>
    )
}

export function PortfolioImageText({ value, placeholder, label, editable, className, onChange }: {
    value: string
    placeholder: string
    label: string
    editable: boolean
    className: string
    onChange: (value: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const cancelRef = useRef(false)

    function save() {
        if (!cancelRef.current) onChange(draft.trim())
        setEditing(false)
    }

    if (!editable) return <p className={className}>{value || placeholder}</p>
    if (editing) return (
        <input autoFocus aria-label={label} value={draft}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur() }
                if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cancelRef.current = true; setEditing(false) }
            }}
            placeholder={placeholder} className={`${className} pointer-events-auto min-w-0 border-0 border-b border-current bg-transparent outline-none`} />
    )
    return (
        <button type="button" aria-label={`Edit ${label}`} onClick={(e) => { e.stopPropagation(); cancelRef.current = false; setDraft(value === placeholder ? "" : value); setEditing(true) }}
            className={`${className} pointer-events-auto block truncate bg-transparent text-left outline-none focus-visible:underline`}>
            {value || placeholder}
        </button>
    )
}