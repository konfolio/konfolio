// /components/my-portfolios/dashboard/HoverTag.tsx
"use client"

type Props = {
  label: string
  className?: string
}

export default function HoverTag({ label, className = "" }: Props) {
  return (
    <div className={["relative inline-flex items-center justify-center", className].join(" ")}>
      {/* Tag */}
      <div
        className="
          inline-flex items-center justify-center
          h-[23px] px-[10px]
          bg-[#262626]
          rounded-[15px]
          whitespace-nowrap
        "
      >
        <span className="font-inter text-[12px] leading-[130%] text-white">
          {label}
        </span>
      </div>

      {/* Arrow */}
      <div
        className="
          absolute
          left-1/2 -translate-x-1/2
          bottom-[-8px]
          w-[27px] h-[8px]
          flex items-center justify-center
          pointer-events-none
        "
      >
        <svg
          width="27"
          height="8"
          viewBox="0 0 27 8"
          xmlns="http://www.w3.org/2000/svg"
          className="block"
        >
          <path
            d="M21.9941 1.44265L16.4088 6.95905C15.8245 7.53601 14.8849 7.53601 14.3006 6.95905L8.71529 1.44265C7.77952 0.518336 6.51715 0 5.2018 0H25.5076C24.1922 0 22.9299 0.518336 21.9941 1.44265Z"
            fill="#262626"
          />
        </svg>
      </div>
    </div>
  )
}