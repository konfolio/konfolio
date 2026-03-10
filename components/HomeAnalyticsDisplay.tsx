"use client";

import { useEffect, useState } from "react";

type Metrics = {
  totalViewings: number;
  uniqueViewers: number;
};

export default function HomeAnalyticsDisplay() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/analytics/home-metrics")
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        // Basic shape guard in case the API returns { error: ... }
        if (
          typeof json?.totalViewings === "number" &&
          typeof json?.uniqueViewers === "number"
        ) {
          setData(json);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (error) return null;
  if (!data) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="w-[260px] sm:w-[300px] rounded-2xl border border-black/10 bg-white/80 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
            <p className="text-[12px] uppercase tracking-[0.18em] text-black/70">
              Homepage Analytics
            </p>
          </div>

          <span className="text-[11px] text-black/45">Live</span>
        </div>

        {/* Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Views" value={data.totalViewings} />
            <StatCard label="Unique Visitors" value={data.uniqueViewers} />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-black/45">
            <span>Counts update on refresh</span>
            <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5">
              dev
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-black/55">
        {label}
      </div>
      <div className="mt-1 text-[26px] leading-none font-medium text-[#262626] tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}