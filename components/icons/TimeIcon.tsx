// /components/icons/TimeIcon.tsx
import * as React from "react"

export default function TimeIcon({
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
      <g clipPath="url(#clip0_1676_8568)">
        <path
          d="M8.50012 5.3125V8.5L11.1564 10.0937"
          stroke="currentColor"
          strokeWidth={1.0167}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.2189 6.90526H14.8741V4.25"
          stroke="currentColor"
          strokeWidth={1.3556}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5108 12.75C11.6755 13.5383 10.6263 14.0629 9.4945 14.2583C8.36268 14.4537 7.19837 14.3113 6.14705 13.8488C5.09572 13.3863 4.204 12.6242 3.5833 11.6578C2.96261 10.6914 2.64046 9.56349 2.65711 8.41505C2.67376 7.2666 3.02847 6.14853 3.67692 5.20053C4.32537 4.25252 5.2388 3.51662 6.30309 3.08478C7.36739 2.65294 8.53534 2.54431 9.66101 2.77245C10.7867 3.0006 11.8202 3.5554 12.6323 4.36755C13.4139 5.15911 14.0594 5.90552 14.8749 6.90626"
          stroke="currentColor"
          strokeWidth={1.0167}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1676_8568">
          <rect width="17" height="17" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}