import { supabase } from "@/lib/supabase/browser"

export async function updateKonfolioName(
  konfolioId: string,
  portfolioName: string
) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error("No active session")
  }

  const res = await fetch(`/api/konfolios/${konfolioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      portfolio_name: portfolioName,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Failed to update name (${res.status})`)
  }

  return await res.json().catch(() => null)
}