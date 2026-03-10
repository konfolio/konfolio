// /components/icons/UserIcon.tsx
import * as React from "react"

export default function UserIcon({
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
      <g clipPath="url(#clip0_918_7329)">
        <path
          d="M8.50037 10.625C10.8476 10.625 12.7504 8.72221 12.7504 6.375C12.7504 4.02779 10.8476 2.125 8.50037 2.125C6.15316 2.125 4.25037 4.02779 4.25037 6.375C4.25037 8.72221 6.15316 10.625 8.50037 10.625Z"
          stroke="currentColor"
          strokeWidth={1.0167}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.12537 14.3438C3.41166 12.1211 5.74783 10.625 8.50037 10.625C11.2529 10.625 13.5891 12.1211 14.8754 14.3438"
          stroke="currentColor"
          strokeWidth={1.0167}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_918_7329">
          <rect width="17" height="17" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}