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
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.9167 6.5H1.08337"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.41663 10.8334L1.08329 6.50004L5.41663 2.16671"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}
