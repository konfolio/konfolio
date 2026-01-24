import * as React from "react"

type Props = React.SVGProps<SVGSVGElement>

export default function BrushIcon({ className, ...props }: Props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_726_6454)">
        <path
          d="M4.5 6.5L9.5 11.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.75 11.75L4.5 10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.25 13.25L6 11.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.75 7.75001L10.7931 8.79313C10.9805 8.98065 11.0858 9.2349 11.0858 9.50001C11.0858 9.76511 10.9805 10.0194 10.7931 10.2069L6 15L1 10L5.79313 5.20688C5.98064 5.01949 6.2349 4.91422 6.5 4.91422C6.7651 4.91422 7.01936 5.01949 7.20687 5.20688L8.25 6.25001L11.9375 1.93751C12.2193 1.65572 12.6015 1.49741 13 1.49741C13.3985 1.49741 13.7807 1.65572 14.0625 1.93751C14.3443 2.2193 14.5026 2.60149 14.5026 3.00001C14.5026 3.39852 14.3443 3.78072 14.0625 4.06251L9.75 7.75001Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_726_6454">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
