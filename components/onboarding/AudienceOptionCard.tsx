type Props = {
    title: string
    description: string
    selected?: boolean
    onClick?: () => void
}
  
export default function AudienceOptionCard({
    title,
    description,
    selected = false,
    onClick,
}: Props) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          "box-border flex h-[128px] w-[356px] flex-col items-center justify-center gap-[15px] rounded-[20px] border bg-white p-[30px] text-center",
          "transition",
          selected ? "border-[#262626] shadow-[0_0_0_2px_rgba(38,38,38,0.08)]" : "border-[#A5A5A5]",
          "hover:border-[#262626]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        ].join(" ")}
      >
        <div className="font-roboto text-[20px] font-normal leading-[23px] text-black">
          {title}
        </div>
        <div className="font-inter text-[14px] font-normal leading-[140%] text-[#A5A5A5]">
          {description}
        </div>
      </button>
    )
}
  