import { toBlob, toJpeg, toPng } from "html-to-image"
import jsPDF from "jspdf"

export type KonfolioExportType = "pdf" | "png" | "jpeg"

function safeFileName(name: string) {
  return (name || "konfolio")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function waitForFonts() {
  if ("fonts" in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready
  }
}

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"))

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()

      return new Promise<void>((resolve) => {
        const done = () => resolve()
        img.addEventListener("load", done, { once: true })
        img.addEventListener("error", done, { once: true })
      })
    })
  )
}

export async function exportKonfolioElement({
  element,
  format,
  portfolioName,
  pixelRatio = 3,
  jpegQuality = 0.95,
  backgroundColor = "#ffffff",
}: {
  element: HTMLElement
  format: KonfolioExportType
  portfolioName: string
  pixelRatio?: number
  jpegQuality?: number
  backgroundColor?: string
}) {
  await waitForFonts()
  await waitForImages(element)

  const fileBase = safeFileName(portfolioName)

  if (format === "png") {
    const blob = await toBlob(element, {
      cacheBust: true,
      pixelRatio,
      backgroundColor,
    })

    if (!blob) throw new Error("Failed to generate PNG.")
    downloadBlob(blob, `${fileBase}.png`)
    return
  }

  if (format === "jpeg") {
    const dataUrl = await toJpeg(element, {
      cacheBust: true,
      pixelRatio,
      backgroundColor,
      quality: jpegQuality,
    })

    const blob = await fetch(dataUrl).then((r) => r.blob())
    downloadBlob(blob, `${fileBase}.jpg`)
    return
  }

  const pngDataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio,
    backgroundColor,
  })

  const image = new Image()
  image.src = pngDataUrl

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error("Failed to load PNG for PDF export."))
  })

  const pdf = new jsPDF({
    orientation: image.width >= image.height ? "landscape" : "portrait",
    unit: "pt",
    format: [image.width, image.height],
    compress: true,
  })

  pdf.addImage(pngDataUrl, "PNG", 0, 0, image.width, image.height)
  pdf.save(`${fileBase}.pdf`)
}