import Image from "next/image"
import { roboto } from "@/app/fonts"

export default function Section3Example() {
  return (
    <div className="mx-auto flex w-full max-w-[373px] flex-col items-center gap-[25px] sm:max-w-[560px] md:max-w-[720px] lg:max-w-[900px] xl:h-[518.93px] xl:max-w-none xl:w-[1144px] xl:flex-row xl:gap-[30px]">
      <div className="aspect-[799/519] w-full overflow-hidden rounded-[10px] bg-white xl:h-[518.93px] xl:w-[799px] xl:rounded-[15px]">
        <Image
          src="/images/sayoran_home.png"
          alt="Sayoran portfolio example"
          width={799}
          height={519}
          className="h-full w-full object-cover"
        />
      </div>

      <ul
        className={`${roboto.className} w-[260px] list-none text-center text-[15px] leading-[150%] font-light text-[#262626] sm:w-[320px] sm:text-[18px] md:text-[20px] xl:w-[315px] xl:list-disc xl:pl-5 xl:text-left xl:text-[25px] xl:font-normal`}
      >
        <li>Do less for more</li>
        <li>Consistency is key</li>
        <li>Show your unique quality</li>
      </ul>
    </div>
  )
}