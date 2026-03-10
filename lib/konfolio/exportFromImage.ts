import jsPDF from "jspdf"

export type KonfolioExportType = "pdf" | "png" | "jpeg"

function safeFileName(name: string) {
  return (name || "konfolio")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load export image"))
    img.src = src
  })
}

export async function exportFromImageUrl({
  imageUrl,
  format,
  portfolioName,
}: {
  imageUrl: string
  format: KonfolioExportType
  portfolioName: string
}) {
  const img = await loadImage(imageUrl)
  const fileBase = safeFileName(portfolioName)

  const canvas = document.createElement("canvas")
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not create canvas context")

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  if (format === "png") {
    const dataUrl = canvas.toDataURL("image/png")
    triggerDownload(dataUrl, `${fileBase}.png`)
    return
  }

  if (format === "jpeg") {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
    triggerDownload(dataUrl, `${fileBase}.jpg`)
    return
  }

  const pngDataUrl = canvas.toDataURL("image/png")
  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
    unit: "pt",
    format: [canvas.width, canvas.height],
    compress: true,
  })

  pdf.addImage(pngDataUrl, "PNG", 0, 0, canvas.width, canvas.height)
  pdf.save(`${fileBase}.pdf`)
}