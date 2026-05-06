import { supabase } from "@/lib/supabase/browser"

export type EditNameResult =
  | { ok: true }
  | { ok: false; reason: "duplicate"; message: string }
  | { ok: false; reason: "error"; message: string }

export async function updateKonfolioName(
  konfolioId: string,
  portfolioName: string
): Promise<EditNameResult> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    return {
      ok: false,
      reason: "error",
      message: "No active session",
    }
  }

  const trimmedName = portfolioName.trim()

  const res = await fetch(`/api/konfolios/${konfolioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      portfolio_name: trimmedName,
    }),
  })

  if (res.ok) {
    return { ok: true }
  }

  let message = "Failed to update name"

  try {
    const data = await res.json()
    message = data?.error || message
  } catch {
    const text = await res.text().catch(() => "")
    if (text) message = text
  }

  if (res.status === 409) {
    return {
      ok: false,
      reason: "duplicate",
      message,
    }
  }

  return {
    ok: false,
    reason: "error",
    message,
  }
}