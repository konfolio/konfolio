import Image from "next/image"
import { roboto } from "@/app/fonts"

export default function Section2Example() {
  return (
    <div className="relative mx-auto aspect-[1226/579] w-full max-w-[373px] sm:max-w-[560px] md:max-w-[720px] lg:max-w-[900px] xl:h-[579px] xl:max-w-none xl:w-[1226px]">
      <div className="absolute left-1/2 top-0 aspect-[891.4948/579] h-full -translate-x-1/2 overflow-hidden rounded-[10px] border border-[#E5E5E5] bg-white shadow-[2px_2px_8px_rgba(0,0,0,0.05)] xl:left-[167.33px] xl:h-[579px] xl:w-[891.4948px] xl:translate-x-0 xl:rounded-[21.32px] xl:border-[0.59px] xl:border-[#A5A5A566] xl:shadow-[4.26px_4.26px_15.99px_0px_rgba(0,0,0,0.05)]">
        <Image
          src="/images/penelope_home.png"
          alt="Penelope portfolio example"
          fill
          className="object-cover"
        />
      </div>

      {/* Hide annotations until xl so they don't crowd small screens */}
      <div className="hidden xl:block">
        {/* keep your original annotation code here */}
      </div>
    </div>
  )
}