"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  
  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return;
      const userId = data.user?.id;
      if (!userId) return;

      const key = `test-viewed-${userId}`;
      if (sessionStorage.getItem(key)) return;

      await supabase.rpc("increment_profile_views", {
        p_profile_id: userId,
      });

      sessionStorage.setItem(key, "true");
    };

    run();
  }, []);


  async function signUp() {
    setStatus("Signing up...");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setStatus(`Error: ${error.message}`);
    setStatus(`Signed up. User id: ${data.user?.id ?? "none"} (check Supabase → Auth → Users)`);
  }

  async function signIn() {
    setStatus("Signing in...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setStatus(`Error: ${error.message}`);
    setStatus(`Signed in. User id: ${data.user?.id ?? "none"}`);
  }

  async function setRole(role: "artist" | "vendor") {
    setStatus(`Saving role: ${role}...`);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) return setStatus(`Error: ${userErr.message}`);

    const userId = userData.user?.id;
    if (!userId) return setStatus("Not logged in.");

    const { error } = await supabase
      .from("profiles")
      .update({ role, onboarding_complete: true })
      .eq("id", userId);

    if (error) return setStatus(`DB Error: ${error.message}`);
    setStatus(`Saved role=${role}. Check Supabase → Table Editor → profiles.`);
  }

  async function uploadImage(file: File) {
  setStatus("Uploading image...");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return setStatus("Not logged in.");

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/profile-image/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const json = await res.json();
  if (!res.ok) return setStatus(`Upload error: ${json.error}`);
  setStatus(`Upload success! URL:\n${json.profileImageUrl}`);
  setProfileImageUrl(json.profileImageUrl);
}

async function submitOnboardingTest() {
  setStatus("Submitting onboarding...");

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return setStatus("Not logged in.");

  // Minimal test payload (artist mode)
  const payload = {
    mode: "artist",
    firstName: "Maya",
    lastName: "Test",
    acceptedTerms: true,
    preferredName: "Maya",
    businessName: "Konfolio Test Shop",
    location: "Davis, CA",
    salesPermit: "no",
    willApply: true,
    collabs: ["stickers", "prints"],
    merchTags: ["anime", "cute"],
    firstVend: true,
    prevVends: [],
    links: { instagram: "https://instagram.com/example", website: "https://example.com" },
    profileImageUrl: profileImageUrl || null,
  };

  const res = await fetch("/api/onboarding/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) return setStatus(`Submit error: ${json.error}`);

  setStatus("Submit success! Check Supabase → Table Editor → profiles");
}



  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Supabase Auth + Onboarding Test</h1>

      <p style={{ marginTop: 8 }}>
        This page is temporary. It just proves signup/login + profiles update works.
      </p>

      <div style={{ marginTop: 16 }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <input
          placeholder="password (6+ chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <input
            type="file"
            accept="image/*"
            onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);}}
        />


        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={signUp}>Sign Up</button>
          <button onClick={signIn}>Sign In</button>
          <button onClick={() => setRole("artist")}>Set role: artist</button>
          <button onClick={() => setRole("vendor")}>Set role: vendor</button>
          <button
  onClick={submitOnboardingTest}
  style={{ marginTop: 12 }}
>
  Submit onboarding (test)
</button>

        </div>

        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{status}</pre>
      </div>
    </div>
  );
}
