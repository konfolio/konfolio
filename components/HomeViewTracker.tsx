"use client";

import { useEffect } from "react";

function getOrCreateViewerId(): string {
  const key = "viewer_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export default function HomeViewTracker() {
  useEffect(() => {
    const viewerId = getOrCreateViewerId();

    fetch("/api/analytics/home-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewerId }),
    }).catch(() => {
      // ignore analytics failures
    });
  }, []);

  return null; // renders nothing
}