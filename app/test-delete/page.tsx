"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestDelete() {
  const [konfolioId, setKonfolioId] = useState("");
  const [out, setOut] = useState<any>(null);

  async function handleDelete() {
    setOut(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setOut({ error: "Not logged in" });
      return;
    }

    const res = await fetch(`/api/konfolios/${konfolioId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    setOut({ status: res.status, json });
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Delete Konfolio</h1>

      <input
        value={konfolioId}
        onChange={(e) => setKonfolioId(e.target.value)}
        placeholder="Paste konfolioId"
        style={{ width: 460, padding: 8 }}
      />

      <button
        onClick={handleDelete}
        style={{ marginLeft: 12, padding: 10 }}
      >
        Delete
      </button>

      {out && (
        <pre
          style={{
            marginTop: 16,
            background: "#111",
            color: "#0f0",
            padding: 16,
          }}
        >
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </div>
  );
}