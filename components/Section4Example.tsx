import Image from "next/image"
import { roboto } from "@/app/fonts"
import PencilIcon from "@/components/icons/PencilIcon"
import ThumbsUpIcon from "@/components/icons/ThumbsUpIcon"
import PaletteIcon from "@/components/icons/PaletteIcon"

function Point({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-[7.8px]">
      <div className="flex h-[16px] w-[16px] items-center justify-center sm:h-[20px] sm:w-[20px] xl:h-[25px] xl:w-[25px]">
        {icon}
      </div>
      <span className={`${roboto.className} text-[14px] leading-[100%] font-light text-[#262626] sm:text-[18px] xl:text-[25px] xl:font-normal`}>
        {text}
      </span>
    </div>
  )
}

export default function Section4Example() {
  return (
    <div className="mx-auto flex w-full max-w-[373px] flex-col items-center gap-[35px] sm:max-w-[560px] md:max-w-[720px] lg:max-w-[900px] xl:h-[863.67px] xl:max-w-none xl:w-[1132.76px] xl:gap-[38.99px]">
      <h2 className={`${roboto.className} w-[289px] text-center text-[19px] leading-[115%] font-light text-[#262626] sm:w-full sm:text-[26px] xl:text-left xl:text-[35px] xl:leading-[41px]`}>
        Let Konfolio be your{" "}
        <span className="italic font-medium">first portfolio</span>
      </h2>

      <div className="aspect-[1133/736] w-full overflow-hidden rounded-[10px] border border-[rgba(165,165,165,0.4)] bg-white shadow-[1.22px_1.22px_4.58px_rgba(0,0,0,0.2)] xl:h-[735.69px] xl:w-[1132.76px] xl:rounded-[22.3489px] xl:shadow-[4px_4px_15px_rgba(0,0,0,0.15)]">
        <Image
          src="/images/section4_example.png"
          alt="Konfolio before and after showcase"
          width={1133}
          height={736}
          className="h-full w-full object-cover"
          priority={false}
        />
      </div>

      <div className="flex w-full flex-col items-center gap-[15px] md:flex-row md:justify-center md:gap-[30px] xl:h-[25px] xl:w-[1132.76px] xl:justify-between xl:gap-0">
        <Point icon={<PencilIcon />} text="Personalize your description" />
        <Point icon={<ThumbsUpIcon />} text="Recommended image placement" />
        <Point icon={<PaletteIcon />} text="Customize your portfolio" />
      </div>
    </div>
  )
}