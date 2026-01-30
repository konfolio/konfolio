import Link from "next/link"

type Props = {
  href: string
  className?: string
}

export default function ArrowLeft({ href, className = "" }: Props) {
  return (
    <Link
      href={href}
      aria-label="Back"
      className={`w-[24px] h-[24px] flex items-center justify-center ${className}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_706_7705)">
          <path
            d="M2 12H22"
            stroke="#262626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 20L2 12L10 4"
            stroke="#262626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_706_7705">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Link>
  )
}
