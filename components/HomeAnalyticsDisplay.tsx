"use client";

import { useEffect, useState } from "react";

export default function HomeAnalyticsDisplay() {
  const [data, setData] = useState<{
    totalViewings: number;
    uniqueViewers: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics/home-metrics")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-xl shadow-lg text-sm">
      <div>Total Views: {data.totalViewings}</div>
      <div>Unique Visitors: {data.uniqueViewers}</div>
    </div>
  );
}