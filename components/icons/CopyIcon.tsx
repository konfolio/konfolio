// components/icons/CopyIcon.tsx
import type { SVGProps } from "react"

export default function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_copy)">
        <path
          d="M7.1875 2.81238H1.5625V8.43738H7.1875V2.81238Z"
          stroke="currentColor"
          strokeWidth="0.6778"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.81238 1.5625H8.43738V7.1875"
          stroke="currentColor"
          strokeWidth="0.6778"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_copy">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}