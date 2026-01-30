import Image from "next/image"
import { roboto } from "@/app/fonts"

export default function Section2Example() {
  return (
    <div className="relative w-[1226px] h-[579px]">
      {/* Center image */}
      <div
        className="
          absolute top-0 left-[167.33px]
          w-[891.4948px] h-[579px]
          rounded-[21.32px]
          border-[0.59px] border-[#A5A5A566]
          shadow-[4.26px_4.26px_15.99px_0px_rgba(0,0,0,0.05)]
          overflow-hidden
          bg-white
        "
      >
        <Image
          src="/images/penelope_home.png"
          alt="Penelope portfolio example"
          fill
          className="object-cover"
        />
      </div>

      {/* Annotation: "Your Art" */}
      <div className="absolute left-[30px] top-[195px] w-[196px] flex items-center gap-[16px]">
        <span
          className={`${roboto.className} w-[80px] text-[22px] leading-[26px] font-normal text-[#262626] text-right whitespace-nowrap`}
        >
          Your Art
        </span>

        <div className="relative w-[100px] h-0 border-t border-[#262626]">
          {/* dot at the end */}
          <span className="absolute right-[-4px] top-[-4px] w-[8px] h-[8px] rounded-full bg-[#262626]" />
        </div>
      </div>

      {/* Annotation: "Products" */}
      <div className="absolute left-[21px] top-[421px] w-[205px] flex items-center gap-[16px]">
        <span
          className={`${roboto.className} w-[89px] text-[22px] leading-[26px] font-normal antialiased text-[#262626] text-right whitespace-nowrap`}
        >
          Products
        </span>

        <div className="relative w-[100px] h-0 border-t border-[#262626]">
          <span className="absolute right-[-4px] top-[-4px] w-[8px] h-[8px] rounded-full bg-[#262626]" />
        </div>
      </div>

      {/* Annotation: "You" */}
      <div className="absolute right-[76px] top-[42px] w-[154px] flex items-center gap-[16px]">
        {/* line + left dot */}
        <div className="relative w-[100px] h-0 border-t border-[#262626]">
          <span className="absolute left-[-4px] top-[-4px] w-[8px] h-[8px] rounded-full bg-[#262626]" />
        </div>

        <span
          className={`${roboto.className} w-[38px] text-[22px] leading-[26px] font-normal antialiased text-[#262626] whitespace-nowrap`}
        >
          You
        </span>
      </div>

      {/* Annotation: "Table Display" */}
      <div className="absolute right-[4px] top-[431px] w-[226px] flex items-center gap-[16px]">
        <div className="relative w-[80px] h-0 border-t border-[#262626]">
          <span className="absolute left-[-4px] top-[-4px] w-[8px] h-[8px] rounded-full bg-[#262626]" />
        </div>

        <span
          className={`${roboto.className} w-[130px] text-[22px] leading-[26px] font-normal antialiased text-[#262626] whitespace-nowrap`}
        >
          Table Display
        </span>
      </div>

      {/* Annotation: "Past Vends" */}
      <div className="absolute right-[3px] top-[549px] w-[227px] flex items-center gap-[16px]">
        <div className="relative w-[100px] h-0 border-t border-[#262626]">
          <span className="absolute left-[-4px] top-[-4px] w-[8px] h-[8px] rounded-full bg-[#262626]" />
        </div>

        <span
          className={`${roboto.className} w-[111px] text-[22px] leading-[26px] font-normal antialiased text-[#262626] whitespace-nowrap`}
        >
          Past Vends
        </span>
      </div>
    </div>
  )
}
