export type ImageFrameMetrics = {
    frameWidth: number
    frameHeight: number
    imageWidth: number
    imageHeight: number
}

export type ImageFraming = { panX?: number; panY?: number; zoom?: number; rotate?: number }

function finite(value: number | undefined, fallback: number) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export function getImageFrame(metrics: ImageFrameMetrics, edits: ImageFraming) {
    const fw = Math.max(1, metrics.frameWidth)
    const fh = Math.max(1, metrics.frameHeight)
    const iw = Math.max(1, metrics.imageWidth)
    const ih = Math.max(1, metrics.imageHeight)
    const cover = Math.max(fw / iw, fh / ih)
    const width = iw * cover
    const height = ih * cover
    const scale = 1 + Math.max(0, Math.min(100, finite(edits.zoom, 0))) / 100
    const rotation = (Math.max(0, Math.min(100, finite(edits.rotate, 50))) - 50) / 50 * 180
    const radians = rotation * Math.PI / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    const maxX = Math.max(0, (width * scale - fw * Math.abs(cos) - fh * Math.abs(sin)) / 2)
    const maxY = Math.max(0, (height * scale - fw * Math.abs(sin) - fh * Math.abs(cos)) / 2)
    const requestedX = finite(edits.panX, 0) / 100 * fw
    const requestedY = finite(edits.panY, 0) / 100 * fh
    const localX = Math.max(-maxX, Math.min(maxX, requestedX * cos + requestedY * sin))
    const localY = Math.max(-maxY, Math.min(maxY, -requestedX * sin + requestedY * cos))
    const x = localX * cos - localY * sin
    const y = localX * sin + localY * cos
    return { width, height, scale, rotation, x, y, panX: x / fw * 100, panY: y / fh * 100 }
}