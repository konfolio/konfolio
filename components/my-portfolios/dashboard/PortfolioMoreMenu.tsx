"use client"

import * as React from "react"

export type PortfolioMoreAction =
  | "editName"
  | "linkAccessOnly"
  | "duplicate"
  | "editUrl"
  | "export"
  | "delete"

type IconComponent = React.ComponentType<{ className?: string }>

type Props = {
  open: boolean
  onClose: () => void
  onAction?: (action: PortfolioMoreAction) => void
  exploreEnabled: boolean

  icons: {
    editName: IconComponent
    linkAccessOnly: IconComponent
    duplicate: IconComponent
    editUrl: IconComponent
    export: IconComponent
    delete: IconComponent
  }

  figmaOffset?: { rightPx: number; topPx: number }
}

export default function PortfolioMoreMenu({
  open,
  onClose,
  onAction,
  exploreEnabled,
  icons,
  figmaOffset = { rightPx: 325, topPx: 97 },
}: Props) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current
      if (!el) return
      if (el.contains(e.target as Node)) return
      onClose()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const linkAccessLabel = exploreEnabled ? "Link Access Only" : "Show in Explore"

  return (
    <div ref={rootRef} className="absolute right-0 top-[calc(100%+8px)] z-50">
      <div
        className={[
          "relative",
          `right-[${figmaOffset.rightPx}px]`,
          `top-[${figmaOffset.topPx}px]`,
        ].join(" ")}
      >
        <div
          role="menu"
          aria-label="Portfolio more menu"
          className={[
            "relative w-[200px] h-[250px]",
            "flex flex-col items-center",
            "p-[10px] gap-[5px]",
            "bg-white rounded-[15px]",
            "shadow-[2px_2px_10px_rgba(0,0,0,0.1)]",
          ].join(" ")}
        >
          <MenuItem
            label="Edit Name"
            Icon={icons.editName}
            variant="default"
            onClick={() => {
              onClose()
              onAction?.("editName")
            }}
          />

          <MenuItem
            label={linkAccessLabel}
            Icon={icons.linkAccessOnly}
            variant="default"
            onClick={() => {
              onClose()
              onAction?.("linkAccessOnly")
            }}
          />

          <MenuItem
            label="Duplicate"
            Icon={icons.duplicate}
            variant="default"
            onClick={() => {
              onClose()
              onAction?.("duplicate")
            }}
          />

          <Divider />

          <MenuItem
            label="Edit URL"
            Icon={icons.editUrl}
            variant="default"
            onClick={() => {
              onClose()
              onAction?.("editUrl")
            }}
          />

          <MenuItem
            label="Export"
            Icon={icons.export}
            variant="default"
            onClick={() => {
              onClose()
              onAction?.("export")
            }}
          />

          <MenuItem
            label="Delete"
            Icon={icons.delete}
            variant="danger"
            onClick={() => {
              onClose()
              onAction?.("delete")
            }}
          />
        </div>
      </div>
    </div>
  )
}

function MenuItem({
  label,
  Icon,
  variant,
  onClick,
}: {
  label: string
  Icon: IconComponent
  variant: "default" | "danger"
  onClick: () => void
}) {
  const isDanger = variant === "danger"

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex flex-row items-center",
        "px-[10px] py-0 gap-[10px]",
        "w-[180px] h-[30px] rounded-[10px]",
        "cursor-pointer",
      ].join(" ")}
    >
      <div className="flex flex-row items-center px-0 py-[2px] gap-[10px] w-[160px] h-[18px]">
        <span
          className={[
            "w-[14px] h-[14px] inline-flex items-center justify-center",
            isDanger ? "text-[#FF4603]" : "text-[#A5A5A5]",
          ].join(" ")}
          aria-hidden="true"
        >
          <Icon className="w-[14px] h-[14px]" />
        </span>

        <span
          className={[
            "flex-1 h-[18px] flex items-center",
            "font-normal text-[14px] leading-[130%]",
            isDanger ? "text-[#FF4603]" : "text-[#262626]",
          ].join(" ")}
        >
          {label}
        </span>
      </div>
    </button>
  )
}

function Divider() {
  return (
    <div className="flex flex-row items-center w-[180px] h-[20px] rounded-[10px] py-[10px]">
      <div className="w-[180px] h-0 border-t border-t-[#D3D3D3]" />
    </div>
  )
}