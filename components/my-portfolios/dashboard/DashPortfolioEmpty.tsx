"use client"

type Props = {
  className?: string
  onClick?: () => void
}

export default function DashPortfolioEmpty({ className = "", onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        box-border
        flex flex-col
        justify-center
        items-center

        p-[12.7837px]
        gap-[15.98px]

        w-full
        max-w-[390px]
        min-h-[320px]
        sm:h-[380px]

        bg-white
        border border-[rgba(165,165,165,0.3)]
        rounded-[14.4414px]

        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
    >
      <div className="flex flex-col items-center justify-center gap-[6.39px] w-full">
        <div
          className="
            w-full
            text-center
            font-normal
            text-[15.9797px]
            leading-[19px]
            text-[#A5A5A5]
          "
          style={{ fontFamily: "Roboto" }}
        >
          + Create your first Konfolio
        </div>
      </div>
    </button>
  )
}
