"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { getImageFrame, type ImageFrameMetrics, type ImageFraming } from "@/lib/imageFraming"

export default function ReframedImage({ src, alt, edits, filter, onMetrics }: {
    src: string
    alt: string
    edits: ImageFraming
    filter?: CSSProperties["filter"]
    onMetrics?: (metrics: ImageFrameMetrics) => void
}) {
    const frameRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [natural, setNatural] = useState({ src, width: 0, height: 0 })
    useEffect(() => {
        const image = imageRef.current
        if (image?.complete && image.naturalWidth && image.naturalHeight) {
            setNatural({ src, width: image.naturalWidth, height: image.naturalHeight })
        }
    }, [src])
    useEffect(() => {
        const element = frameRef.current
        if (!element) return
        const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight })
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        return () => observer.disconnect()
    }, [])
    const imageWidth = natural.src === src ? natural.width : 0
    const imageHeight = natural.src === src ? natural.height : 0
    useEffect(() => {
        if (size.width && size.height && imageWidth && imageHeight) {
            onMetrics?.({ frameWidth: size.width, frameHeight: size.height, imageWidth, imageHeight })
        }
    }, [size.width, size.height, imageWidth, imageHeight, onMetrics])
    const frame = size.width && size.height && imageWidth && imageHeight
        ? getImageFrame({ frameWidth: size.width, frameHeight: size.height, imageWidth, imageHeight }, edits)
        : null

    return (
        <div ref={frameRef} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imageRef} src={src} alt={alt} draggable={false}
                onLoad={(event) => setNatural({ src, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                className="absolute select-none object-cover"
                style={frame ? {
                    width: frame.width, height: frame.height, maxWidth: "none", left: "50%", top: "50%",
                    transformOrigin: "center", transform: `translate(-50%, -50%) translate(${frame.x}px, ${frame.y}px) rotate(${frame.rotation}deg) scale(${frame.scale})`, filter,
                } : { inset: 0, width: "100%", height: "100%", filter }} />
        </div>
    )
}