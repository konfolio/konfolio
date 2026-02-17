import Link from "next/link"
import { inknut } from "@/app/fonts" 

export default function AuthHeader() {
  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-[61px] w-[1512px] items-center justify-center px-[150px] pt-[15px] pb-[10px] max-w-full">
        <div className="flex h-[36px] w-[1212px] items-center justify-center max-w-full">
            <Link href="/" className="flex items-center">
                <span
                    className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold`}
                >
                    konfolio
                </span>
            </Link>
        </div>
      </div>
    </header>
  )
}
