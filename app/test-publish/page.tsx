"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestPublish() {
  const [konfolioId, setKonfolioId] = useState("");
  const [out, setOut] = useState<any>(null);

  async function publish() {
    setOut(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return setOut({ error: "Not logged in" });

    const res = await fetch(`/api/konfolios/${konfolioId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    setOut({ status: res.status, json });
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Publish + Thumbnail</h1>
      <input
        value={konfolioId}
        onChange={(e) => setKonfolioId(e.target.value)}
        placeholder="konfolioId"
        style={{ width: 460, padding: 8 }}
      />
      <button onClick={publish} style={{ marginLeft: 12, padding: 10 }}>
        Publish
      </button>

      {out && (
        <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 16 }}>
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </div>
  );
}