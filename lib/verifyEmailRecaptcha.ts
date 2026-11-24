import "server-only"

import { createPublicFormsAdminClient } from "@/lib/publicFormLookup"

type VerificationResult =
  | { ok: true }
  | {
      ok: false
      reason: "invalid" | "monthly_limit" | "unavailable"
    }

export async function verifyEmailRecaptcha(
  token: unknown,
): Promise<VerificationResult> {
  if (
    typeof token !== "string" ||
    token.trim().length === 0 ||
    token.length > 10000
  ) {
    return { ok: false, reason: "invalid" }
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY
  const allowedHosts = new Set(
    (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  )

  if (!secret || allowedHosts.size === 0) {
    return { ok: false, reason: "unavailable" }
  }

  try {
    const db = createPublicFormsAdminClient()

    // Reserve BEFORE contacting Google. This is shared across
    // server instances and cannot exceed the database limit.
    const { data: reserved, error } = await db.rpc(
      "reserve_recaptcha_assessment",
    )

    if (error) {
      console.error("reCAPTCHA counter unavailable:", error.code)
      return { ok: false, reason: "unavailable" }
    }

    if (reserved === false) {
      return { ok: false, reason: "monthly_limit" }
    }

    if (reserved !== true) {
      return { ok: false, reason: "unavailable" }
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret,
          response: token,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!response.ok) {
      return { ok: false, reason: "unavailable" }
    }

    const result = await response.json()

    if (!result || typeof result !== "object") {
      return { ok: false, reason: "invalid" }
    }

    // Reject errors even if Google also returns a passing score.
    const errors = result["error-codes"]
    const hasErrors =
      errors !== undefined &&
      (!Array.isArray(errors) || errors.length > 0)

    const timestamp =
      typeof result.challenge_ts === "string"
        ? Date.parse(result.challenge_ts)
        : NaN

    const ageMs = Date.now() - timestamp

    const valid =
      !hasErrors &&
      result.success === true &&
      result.action === "reveal_email" &&
      typeof result.score === "number" &&
      Number.isFinite(result.score) &&
      result.score >= 0.5 &&
      result.score <= 1 &&
      typeof result.hostname === "string" &&
      allowedHosts.has(result.hostname.toLowerCase()) &&
      Number.isFinite(ageMs) &&
      ageMs >= -30000 &&
      ageMs <= 120000

    return valid
      ? { ok: true }
      : { ok: false, reason: "invalid" }
  } catch {
    // Keep the reserved slot after uncertain failures.
    // Never expose an email when verification is unavailable.
    return { ok: false, reason: "unavailable" }
  }
}