// /components/icons/EyeIcon.tsx
import * as React from "react"

export default function EyeIcon({
  size = 17,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_918_7312)">
        <path
          d="M8.49976 3.71875C3.18726 3.71875 1.06226 8.5 1.06226 8.5C1.06226 8.5 3.18726 13.2812 8.49976 13.2812C13.8123 13.2812 15.9373 8.5 15.9373 8.5C15.9373 8.5 13.8123 3.71875 8.49976 3.71875Z"
          stroke="currentColor"
          strokeWidth={1.0167}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.50012 11.1562C9.96713 11.1562 11.1564 9.96701 11.1564 8.5C11.1564 7.03299 9.96713 5.84375 8.50012 5.84375C7.03312 5.84375 5.84387 7.03299 5.84387 8.5C5.84387 9.96701 7.03312 11.1562 8.50012 11.1562Z"
          stroke="currentColor"
          strokeWidth={1.0167}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_918_7312">
          <rect width="17" height="17" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}