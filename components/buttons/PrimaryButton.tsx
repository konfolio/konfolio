import Link from "next/link"
import ArrowRight from "@/components/icons/ArrowRight"
import OpenTabIcon from "@/components/icons/OpenTabIcon"

type Props = {
  href: string
  children: string
  className?: string
  icon?: "arrow" | "open"
}

export default function PrimaryButton({
  href,
  children,
  className = "",
  icon = "arrow",
}: Props) {
  return (
    <Link
      href={href}
      className={`
        group
        flex items-center justify-center
        gap-[7px]
        h-[39px] min-w-[150px]
        px-[40px] py-[13px]
        rounded-[100px]
        bg-[#262626]
        text-white
        text-[14px] leading-[140%]
        font-normal
        transition-all duration-100 ease-out
        hover:bg-[#262626CC]
        active:bg-[#262626B2]
        whitespace-nowrap
        ${className}
      `}
    >
      <span>{children}</span>

      <span className="flex items-center justify-center">
        {icon === "open" ? <OpenTabIcon /> : <ArrowRight />}
      </span>
    </Link>
  )
}
