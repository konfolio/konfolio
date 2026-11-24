import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { canRevealEmail } from "@/lib/publicKonfolioContent"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store, max-age=0", "Vary": "Origin" }
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers })

export async function POST(req: Request) {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY
    const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "").split(",").map(h => h.trim().toLowerCase()).filter(Boolean)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    const threshold = Number(process.env.RECAPTCHA_MIN_SCORE || "0.5")
    if (
  !secret ||
  !hosts.length ||
  !url ||
  !key ||
  !Number.isFinite(threshold) ||
  threshold < 0 ||
  threshold > 1
) {
  console.error("[email-reveal] Configuration check failed:", {
    hasRecaptchaSecret: Boolean(secret),
    hasAllowedHostnames: hosts.length > 0,
    hasSupabaseUrl: Boolean(url),
    hasServiceRoleKey: Boolean(key),
    validThreshold:
      Number.isFinite(threshold) &&
      threshold >= 0 &&
      threshold <= 1,
  })

  return reply(
    { error: "Email verification is unavailable." },
    503,
  )
}
    const origin = req.headers.get("origin")
    if (origin) {
      let originUrl: URL
      try { originUrl = new URL(origin) } catch { return reply({ error: "Invalid origin." }, 403) }
      if (!hosts.includes(originUrl.hostname.toLowerCase()) || !["https:", "http:"].includes(originUrl.protocol))
        return reply({ error: "Invalid origin." }, 403)
    }
    // Bound input even when Content-Length is absent or inaccurate.
    const reader = req.body?.getReader()
    if (!reader) return reply({ error: "Invalid request." }, 400)
    let size = 0, raw = ""
    const decoder = new TextDecoder()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 8192) { await reader.cancel(); return reply({ error: "Request too large." }, 413) }
      raw += decoder.decode(value, { stream: true })
    }
    raw += decoder.decode()
    let body: { konfolioId?: unknown; token?: unknown } | null
    try { body = JSON.parse(raw) } catch { return reply({ error: "Invalid request." }, 400) }
    const id = body?.konfolioId, token = body?.token
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
        typeof token !== "string" || !token.trim() || token.length > 6000)
      return reply({ error: "Invalid request." }, 400)
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: k, error } = await db.from("konfolios").select("content,status").eq("id", id).eq("status", "published").maybeSingle()
    if (error) return reply({ error: "Email verification is unavailable." }, 503)
    if (!k || !canRevealEmail(k.content)) return reply({ error: "Email is unavailable." }, 404)

    // Reserve BEFORE contacting Google; failed verification attempts count too.
    // SQL performs an atomic, site-wide, UTC calendar-month limit of 10,000.
    const { data: allowed, error: quotaError } = await db.rpc("consume_email_recaptcha_quota")
    if (quotaError) {
  console.error("[email-reveal] Monthly quota check failed:", {
    code: quotaError.code,
    message: quotaError.message,
  })

  return reply(
    { error: "Email verification is unavailable." },
    503,
  )
}
    if (allowed !== true) return reply({ error: "Monthly email verification limit reached. Please try again next month." }, 429)
    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST", body: new URLSearchParams({ secret, response: token }),
      cache: "no-store", signal: AbortSignal.timeout(8000),
    })
    if (!verification.ok) return reply({ error: "Email verification is unavailable." }, 503)
    const result = await verification.json()
    const age = Date.now() - Date.parse(result.challenge_ts)
    if (result.success !== true || result.action !== "reveal_email" ||
        typeof result.score !== "number" || !Number.isFinite(result.score) || result.score < threshold || result.score > 1 ||
        typeof result.hostname !== "string" || !hosts.includes(result.hostname.toLowerCase()) ||
        !Number.isFinite(age) || age < -30000 || age > 120000)
      return reply({ error: "Verification failed. Please try again." }, 403)
    // Recheck visibility/publication after verification before releasing data.
    const { data: current, error: currentError } = await db.from("konfolios").select("content,status").eq("id", id).eq("status", "published").maybeSingle()
    if (currentError) return reply({ error: "Email verification is unavailable." }, 503)
    if (!current || !canRevealEmail(current.content)) return reply({ error: "Email is unavailable." }, 404)
    return reply({ email: String(current.content.email).trim() })
  } catch {
    return reply({ error: "Email verification is unavailable. Please retry." }, 503)
  }
}
