import Image from "next/image"
import { roboto } from "@/app/fonts"

export default function Section4Example() {
    return (
        <div className="w-[1144px] h-[518.93px] flex items-center gap-[30px]">
      
            {/* Left: image card */}
            <div
                className="
                w-[799px] h-[518.93px]
                rounded-[15px]
                overflow-hidden
                flex flex-col items-center
                gap-[16.39px]
                bg-white
                "
            >
                <Image
                src="/images/sayoran_home.png"
                alt="Sayoran portfolio example"
                width={799}
                height={518.93}
                className="w-full h-full object-cover"
                />
            </div>

            {/* Right: bulleted text block */}
            <ul
                className={`
                ${roboto.className}
                w-[315px]
                font-normal
                text-[25px]
                leading-[150%]
                text-[#262626]
                list-disc
                pl-5
                `}
            >
                <li>Do less for more</li>
                <li>Consistency is key</li>
                <li>Show your unique quality</li>
            </ul>

            </div>
    )
  }