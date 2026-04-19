"use client"

type Props = {
  content: any
  template: "square" | "portrait"
}

type GridImage = {
  id: string
  src: string
}

export default function ImageGrid({ content, template }: Props) {
  const rawImages =
    content?.images ??
    content?.gridImages ??
    content?.imageUrls ??
    []

  const images: GridImage[] = Array.isArray(rawImages)
    ? rawImages
        .map((img: any, i: number) => {
          if (typeof img === "string") {
            return { id: String(i), src: img }
          }

          return {
            id: img?.id ?? String(i),
            src: img?.src ?? img?.url ?? "",
          }
        })
        .filter((img: GridImage) => img.src)
    : []

  return (
    <section className="w-[922px] flex flex-col items-start py-[30px]">
      <div className="w-[922px]">
        {images.length > 0 ? (
          <div className="w-full grid grid-cols-3 gap-[15px]">
            {images.slice(0, 9).map((img) => (
              <div
                key={img.id}
                className="
                  relative
                  w-full
                  aspect-square
                  rounded-[15px]
                  overflow-hidden
                  bg-[rgba(165,165,165,0.068)]
                  shadow-[2px_4px_25px_rgba(165,165,165,0.1),inset_2.14645px_2.00046px_9.24px_rgba(165,165,165,0.126),inset_1.21725px_1.13446px_4.62px_rgba(165,165,165,0.126)]
                "
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="
              w-full
              aspect-square
              rounded-[15px]
              bg-[rgba(165,165,165,0.068)]
              shadow-[2px_4px_25px_rgba(165,165,165,0.1),inset_2.14645px_2.00046px_9.24px_rgba(165,165,165,0.126),inset_1.21725px_1.13446px_4.62px_rgba(165,165,165,0.126)]
            "
          />
        )}
      </div>
    </section>
  )
}