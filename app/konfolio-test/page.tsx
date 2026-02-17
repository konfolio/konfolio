"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function KonfolioTestPage() {
  const [template, setTemplate] = useState<"square" | "portrait">("square");
  const [konfolioId, setKonfolioId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  async function getToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error("No session token found. Are you logged in?");
    return token;
  }

  async function createFromTemplate() {
    setStatus("Creating...");
    setResult(null);

    const token = await getToken();
    const res = await fetch("/api/konfolios/create-from-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template }),
    });

    const json = await res.json();
    setStatus(`POST create-from-template → ${res.status}`);
    setResult(json);

    if (res.ok && json?.id) setKonfolioId(json.id);
  }

  async function loadKonfolio() {
  if (!konfolioId || konfolioId === "undefined") {
    setStatus(`Enter a valid Konfolio ID (currently: ${String(konfolioId)})`);
    return;
  }

  setStatus(`Loading ${konfolioId}...`);
  setResult(null);

  const token = await getToken();
  const url = `/api/konfolios/${konfolioId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  setStatus(`GET ${url} → ${res.status}`);
  setResult(json);
}

  async function patchKonfolio() {
    if (!konfolioId) {
      setStatus("Enter a Konfolio ID first.");
      return;
    }

    setStatus("Patching...");
    setResult(null);

    const token = await getToken();
    const res = await fetch(`/api/konfolios/${konfolioId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "draft",
        // Minimal content update to prove persistence works
        content: {
          bannerColor: "#ff00ff",
          backgroundColor: "#000000",
          updatedBy: "konfolio-test-page",
          updatedAt: new Date().toISOString(),
        },
      }),
    });

    const json = await res.json();
    setStatus(`PATCH /api/konfolios/:id → ${res.status}`);
    setResult(json);
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Konfolio API Test</h1>
      <p style={{ opacity: 0.8 }}>
        This page tests create/get/patch using your current Supabase client session token.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <label>
          Template:{" "}
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
          >
            <option value="square">square</option>
            <option value="portrait">portrait</option>
          </select>
        </label>

        <button onClick={createFromTemplate}>Create Draft</button>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <label style={{ flex: 1 }}>
          Konfolio ID:{" "}
          <input
            value={konfolioId}
            onChange={(e) => setKonfolioId(e.target.value)}
            placeholder="uuid..."
            style={{ width: "100%" }}
          />
        </label>

        <button onClick={loadKonfolio}>Load</button>
        <button onClick={patchKonfolio}>Patch</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div><b>Status:</b> {status || "(idle)"}</div>
      </div>

      <pre style={{ marginTop: 16, padding: 12, background: "#111", color: "#eee", overflowX: "auto" }}>
        {JSON.stringify(result, null, 2)}
      </pre>

      <p style={{ marginTop: 16, opacity: 0.8 }}>
        If you get “No session token found”, log in first in your app (same localhost:3001).
      </p>
    </div>
  );
}
