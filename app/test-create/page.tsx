"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestCreatePage() {
  const [portfolioName, setPortfolioName] = useState("My Cute Portfolio");
  const [template, setTemplate] = useState<"square" | "portrait">("square");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setResult(null);
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setResult({ error: "Not logged in" });
      setLoading(false);
      return;
    }

    const res = await fetch("/api/konfolios/create-from-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template, portfolioName }),
    });

    const json = await res.json();
    setResult({ status: res.status, json });
    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Create Konfolio</h1>

      <div style={{ marginTop: 16 }}>
        <label>Portfolio Name</label>
        <div>
          <input
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            style={{ width: 420, padding: 8 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Template</label>
        <div>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
            style={{ padding: 8 }}
          >
            <option value="square">square</option>
            <option value="portrait">portrait</option>
          </select>
        </div>
      </div>

      <button onClick={handleCreate} disabled={loading} style={{ marginTop: 16, padding: 10 }}>
        {loading ? "Creating..." : "Create"}
      </button>

      {result && (
        <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 16 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}