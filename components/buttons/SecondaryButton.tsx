// components/buttons/SecondaryButton.tsx
"use client"

import * as React from "react"

type Props = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  /** Optional small diamond icon on the right */
  showDiamond?: boolean
}

function DiamondIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.5 1.5L11.5 6.5L6.5 11.5L1.5 6.5L6.5 1.5Z"
        stroke="#262626"
        strokeWidth="1"
      />
    </svg>
  )
}

export default function SecondaryButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
  showDiamond = false,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        box-border
        inline-flex items-center justify-center
        px-[40px] py-[10px] gap-[7px]
        w-[150px] min-w-[150px] h-[30px]
        border border-[#262626]
        rounded-[100px]
        font-inter font-normal text-[14px] leading-[140%] text-[#262626]
        transition-colors
        hover:bg-[rgba(38,38,38,0.2)]
        active:bg-[rgba(38,38,38,0.4)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="flex items-center gap-[7px] leading-none">
        {children}
      </span>
      {showDiamond ? <DiamondIcon /> : null}
    </button>
  )
}
