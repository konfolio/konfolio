import Image from "next/image"
import { roboto } from "@/app/fonts"
import PencilIcon from "@/components/icons/PencilIcon"
import ThumbsUpIcon from "@/components/icons/ThumbsUpIcon"
import PaletteIcon from "@/components/icons/PaletteIcon"

function Point({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-center gap-[7.8px]">
        <div className="w-[25px] h-[25px] flex items-center justify-center">
            {icon}
        </div>
        <span
            className={`${roboto.className} font-normal text-[25px] leading-[100%] text-[#262626] whitespace-nowrap`}
        >
            {text}
        </span>
    </div>
  )
}

export default function Section4Example() {
  return (
    <div className="w-[1132.76px] h-[863.67px] flex flex-col items-center gap-[38.99px]">
      {/* Title */}
      <h2
        className={`${roboto.className} w-full text-[35px] leading-[41px] tracking-[-0.01em] text-[#262626] font-light`}
      >
        Let Konfolio be your{" "}
        <span className="italic font-medium">first portfolio</span>
      </h2>

      {/* Big image frame */}
      <div
        className="
          w-[1132.76px] h-[735.69px]
          rounded-[22.3489px]
          border border-[rgba(165,165,165,0.4)]
          shadow-[4px_4px_15px_rgba(0,0,0,0.15)]
          overflow-hidden
          bg-white
        "
      >
        <Image
          src="/images/section4_example.png"
          alt="Konfolio before and after showcase"
          width={1133}
          height={736}
          className="w-full h-full object-cover"
          priority={false}
        />
      </div>

      {/* Points row */}
      <div className="w-[1132.76px] h-[25px] flex items-center justify-between">
        <Point icon={<PencilIcon />} text="Personalize your description" />
        <Point icon={<ThumbsUpIcon />} text="Recommended image placement" />
        <Point icon={<PaletteIcon />} text="Customize your portfolio" />
      </div>
    </div>
  )
}
