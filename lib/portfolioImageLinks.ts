/** Only web URLs are allowed as portfolio image destinations. */
export function normalizePortfolioImageUrl(raw: string): string | null {
    const value = raw.trim()
    if (!value) return ""
    if (/\s/.test(value)) return null
    if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) return null

    try {
        const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/\//, "")}`)
        if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) return null
        return url.href
    } catch {
        return null
    }
}