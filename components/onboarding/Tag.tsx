import PlusIcon from "@/components/icons/PlusIcon"

type Props = {
  label: string
  showPlus?: boolean
  className?: string
}

export default function Tag({
  label,
  showPlus = false,
  className = "",
}: Props) {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        gap-[7px]
        px-[22px] py-[7px]
        h-[24px]
        border border-[#A5A5A5]/50
        rounded-full
        whitespace-nowrap
        font-inter font-normal text-[14px] leading-[140%]
        text-[#262626]
        ${className}
      `}
    >
      {showPlus && (
        <span className="text-[#A5A5A5] flex items-center justify-center">
          <PlusIcon />
        </span>
      )}

      <span>{label}</span>
    </div>
  )
}
