export async function updateKonfolioSlug(
    id: string,
    portfolioSlug: string,
    accessToken: string
  ) {
    const res = await fetch(`/api/konfolios/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        portfolio_slug: portfolioSlug,
      }),
    })
  
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || "Failed to update portfolio URL")
    }
  
    return res.json()
  }