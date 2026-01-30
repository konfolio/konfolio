"use client"

type Props = {
  images?: { id: string; src?: string }[]
}

export default function PortfolioImageGrid({ images }: Props) {
  const cells =
    images && images.length > 0
      ? images.slice(0, 9)
      : Array.from({ length: 9 }).map((_, i) => ({ id: String(i), src: "" }))

  return (
    <section className="w-[922px] h-[982px] flex flex-col items-center justify-center py-[30px]">
      {/* Images area (922 x 922) */}
      <div className="w-[922px] h-[922px]">
        <div className="w-full h-full grid grid-cols-3 gap-[15px]">
          {cells.map((img) => (
            <div
              key={img.id}
              className="
                relative
                rounded-[15px]
                overflow-hidden
                bg-[rgba(165,165,165,0.068)]
                shadow-[2px_4px_25px_rgba(165,165,165,0.1),inset_2.14645px_2.00046px_9.24px_rgba(165,165,165,0.126),inset_1.21725px_1.13446px_4.62px_rgba(165,165,165,0.126)]
              "
            >
              {img.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
