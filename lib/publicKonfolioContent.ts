// Call on the SERVER before serializing content into HTML, RSC props, or JSON.
export function canRevealEmail(content: unknown): boolean {
  if (!content || typeof content !== "object" || Array.isArray(content)) return false
  const c = content as Record<string, unknown>
  return c.showEmail !== false && typeof c.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim()) &&
    c.email.trim().toLowerCase() !== "myemailaddress@konfolio.com"
}

export function toPublicKonfolioContent(content: unknown): Record<string, unknown> {
  // Also remove legacy nested email fields. Intentionally entered emails in
  // descriptions, images, or arbitrary links are outside this field's protection.
  function strip(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(strip)
    if (!value || typeof value !== "object") return value
    return Object.fromEntries(Object.entries(value).filter(([key]) =>
      !["email", "emailaddress", "email_address"].includes(key.toLowerCase())
    ).map(([key, item]) => [key, strip(item)]))
  }
  const valid = content && typeof content === "object" && !Array.isArray(content)
  return { ...(valid ? strip(content) as Record<string, unknown> : {}),
    hasPublicEmail: canRevealEmail(content) }
}
