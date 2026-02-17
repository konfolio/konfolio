"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  first_name: string | null;
  views: number | null;
};

export default function TestPortfolioPage() {
  const params = useParams();
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("");

  // 1) Load the profile being "viewed"
  useEffect(() => {
    if (!profileId) return;

    const loadProfile = async () => {
      setStatus("Loading profile...");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, views")
        .eq("id", profileId)
        .single();

      if (error) return setStatus(`Load error: ${error.message}`);

      setProfile(data);
      setStatus("Profile loaded.");
    };

    loadProfile();
  }, [profileId]);

  // 2) Increment views (skip self-views, count once per session)
  useEffect(() => {
    if (!profileId) return;

    const incrementView = async () => {
      const { data } = await supabase.auth.getUser();
      const viewerId = data.user?.id ?? null;

      //if (viewerId === profileId) {
        //setStatus("Not counting self-view.");
        //return;
      //}

      const key = `viewed-${profileId}`;
      if (sessionStorage.getItem(key)) {
        setStatus("Already counted this session.");
        return;
      }

      const { error } = await supabase.rpc("increment_profile_views", {
        p_profile_id: profileId,
      });

      if (error) {
        setStatus(`RPC error: ${error.message}`);
        return;
      }

      sessionStorage.setItem(key, "true");
      setStatus("View counted ✅");

      // Refresh views on screen (optional but helpful)
      const { data: refreshed } = await supabase
        .from("profiles")
        .select("views")
        .eq("id", profileId)
        .single();

      if (refreshed && profile) {
        setProfile({ ...profile, views: refreshed.views });
      }
    };

    incrementView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        Portfolio View Count Test Page
      </h1>

      <p style={{ marginTop: 8 }}>
        Viewing profile ID:
        <br />
        <code>{profileId}</code>
      </p>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
        <p><b>Name:</b> {profile?.first_name ?? "(none)"}</p>
        <p><b>Views:</b> {profile?.views ?? "…"}</p>
      </div>

      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
        {status}
      </pre>

      
    </div>
  );
}
