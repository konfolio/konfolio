"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FormMeta = {
  id: string;
  title?: string | null;
  status?: string | null;
  organizer_id?: string | null;
};

function prettyStatus(status?: string | null) {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function OrganizerFormHeader({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormMeta | null>(null);
  const [appCount, setAppCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const [formRes, appsRes] = await Promise.all([
          fetch(`/api/forms/${formId}`, { cache: "no-store" }),
          fetch(`/api/forms/${formId}/applications`, { cache: "no-store" }),
        ]);

        const formJson = await formRes.json().catch(() => ({}));
        const appsJson = await appsRes.json().catch(() => ({}));

        if (cancelled) return;

        if (formRes.ok) {
          setForm(formJson);
        } else {
          setForm(null);
        }

        if (appsRes.ok) {
          setAppCount(
            Array.isArray(appsJson.applications)
              ? appsJson.applications.length
              : 0,
          );
        } else {
          setAppCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [formId]);

  return (
    <div className="pt-8">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <button
            className="mt-1 text-zinc-500 hover:text-zinc-800"
            aria-label="Back"
            onClick={() => window.history.back()}
          >
            ←
          </button>

          <div>
            <div className="text-2xl font-semibold">
              {loading ? "Loading..." : form?.title || "Untitled Form"}
            </div>

            <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {loading ? "Loading..." : prettyStatus(form?.status)}
                </span>
              </div>

              <span>
                {loading
                  ? "Loading..."
                  : `${appCount} application${appCount === 1 ? "" : "s"}`}
              </span>

              <Link
                href={`/organizer/forms/${formId}/edit`}
                className="underline hover:text-zinc-700"
              >
                Edit Form
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              placeholder=""
              className="h-9 w-56 rounded-full border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
            />
            <span className="absolute left-3 top-2.5 text-zinc-400">⌕</span>
          </div>

          {["Pending", "California", "Bookmark", "+1"].map((t) => (
            <button
              key={t}
              className="h-9 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {t}
            </button>
          ))}

          <button className="h-9 w-9 rounded-full border border-zinc-200 hover:bg-zinc-50">
            ⏷
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-100" />
    </div>
  );
}
