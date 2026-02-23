"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestUploadPage() {
  const [konfolioId, setKonfolioId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    setResult(null);

    if (!file) {
      setResult({ error: "Pick a file first." });
      return;
    }

    if (!konfolioId) {
      setResult({ error: "Enter a konfolioId." });
      return;
    }

    setLoading(true);

    // get current logged in session
    const { data } = await supabase.auth.getSession();
    console.log("session userId:", data.session?.user?.id);
    const token = data.session?.access_token;

    if (!token) {
      setResult({ error: "Not logged in." });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("konfolioId:", konfolioId);
    const res = await fetch(
      `/api/konfolios/${konfolioId}/images/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const json = await res.json();
    setResult({ status: res.status, json });
    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Konfolio Image Upload Test</h1>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Paste konfolioId"
          value={konfolioId}
          onChange={(e) => setKonfolioId(e.target.value)}
          style={{ width: 400, padding: 8 }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ marginTop: 20, padding: 10 }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            background: "#111",
            color: "#0f0",
            padding: 20,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}