"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ApplicationDrawer from "./ApplicationDrawer";

export type Field = {
  id: string;
  label: string;
  field_key: string;
  type: string;
  required: boolean;
  options: any;
  sort_order: number;
};

export type StatusFilter = "pending" | "accepted" | "rejected" | "all";
export type Order = "time_submitted" | "alphabetical";

export type AppRow = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  answers: Record<string, any>;
  organizerNotes?: string;
  tagUsage?: { tag: string; percentage: number }[];

  applicant: {
    id: string;
    role?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    businessName?: string | null;
    businessSlug?: string | null;
    business_slug?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
    links?: Record<string, string> | null;
    tags?: string[] | null;
  };
  konfolio: {
    id: string;
    template: "square" | "portrait";
    thumbnailUrl: string | null;
    thumbnail_url?: string | null;
    portfolioSlug?: string | null;
    portfolio_slug?: string | null;
    content?: any;
  };
};

function formatTimeSubmitted(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** choose an answer key by looking at form field labels/keys */
function pickFieldKey(
  fields: Field[],
  labelMatchers: RegExp[],
  keyFallbacks: string[],
) {
  const byLabel = fields.find((f) =>
    labelMatchers.some((re) => re.test(f.label)),
  );
  if (byLabel?.field_key) return byLabel.field_key;

  const byKey = fields.find((f) => keyFallbacks.includes(f.field_key));
  if (byKey?.field_key) return byKey.field_key;

  return null;
}

export default function ApplicationsTable({
  apps,
  totalCount,
  fields,
  loading,
  errorMsg,
  updatingId,
  onStatusChange,
  onDrawerUpdate,
  onReload,
}: {
  apps: AppRow[];
  totalCount: number;
  fields: Field[];
  loading: boolean;
  errorMsg: string | null;
  updatingId: string | null;
  onStatusChange: (id: string, status: AppRow["status"]) => void;
  onDrawerUpdate: (id: string, updates: Partial<AppRow>) => void;
  onReload: () => void;
}) {
  const [selectedApp, setSelectedApp] = useState<AppRow | null>(null);

  function handleStatusChange(id: string, status: AppRow["status"]) {
    onStatusChange(id, status);
    if (selectedApp?.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, status } : prev));
    }
  }

  function handleDrawerUpdate(id: string, updates: Partial<AppRow>) {
    onDrawerUpdate(id, updates);
    setSelectedApp((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev,
    );
  }


  // ✅ Find the real answer keys for email/location based on your form definition
  const emailKey = useMemo(
    () => pickFieldKey(fields, [/email/i], ["email", "Email"]),
    [fields],
  );

  const locationKey = useMemo(
    () =>
      pickFieldKey(
        fields,
        [/location/i, /city/i, /state/i, /where.*based/i],
        ["location", "Location"],
      ),
    [fields],
  );

  return (
    <>
      <div className="w-full">
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="h-[calc(100vh-260px)] overflow-auto">
            {/* wider so horizontal scroll works like your screenshot */}
            <table className="w-full min-w-[1500px] table-fixed text-[14px]">
              <colgroup>
                <col style={{ width: "56px" }} />
                <col style={{ width: "210px" }} />
                <col style={{ width: "220px" }} />
                <col style={{ width: "180px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "170px" }} />
                <col style={{ width: "200px" }} />
                <col style={{ width: "260px" }} />
                <col style={{ width: "200px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "44px" }} />
                <col style={{ width: "44px" }} />
              </colgroup>

              <thead className="sticky top-0 z-20">
                <tr className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                  <th className="sticky left-0 z-30 bg-zinc-50 px-4 py-4 font-medium text-left">
                    #
                  </th>
                  <th className="px-4 py-4 font-medium text-left">
                    Time Submitted
                  </th>
                  <th className="px-4 py-4 font-medium text-left">Notes</th>
                  <th className="px-4 py-4 font-medium text-left">Staus</th>
                  <th className="px-4 py-4 font-medium text-left">First</th>
                  <th className="px-4 py-4 font-medium text-left">Last</th>
                  <th className="px-4 py-4 font-medium text-left">Preferred</th>
                  <th className="px-4 py-4 font-medium text-left">Business</th>
                  <th className="px-4 py-4 font-medium text-left">Email</th>
                  <th className="px-4 py-4 font-medium text-left">Location</th>
                  <th className="px-4 py-4 font-medium text-left">Konfolio</th>

                  <th className="px-2 py-4 text-center">
                    <button
                      className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-600"
                      aria-label="Add column"
                      onClick={() => {}}
                    >
                      +
                    </button>
                  </th>
                  <th className="px-2 py-4" />
                </tr>
              </thead>

              <tbody className="text-zinc-700">
                {loading && (
                  <tr>
                    <td colSpan={13} className="px-4 py-10 text-zinc-500">
                      Loading…
                    </td>
                  </tr>
                )}

                {!loading && apps.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-4 py-10 text-zinc-500">
                      No applications yet.
                    </td>
                  </tr>
                )}

                {apps.map((a, idx) => {
                  const first = a.applicant.firstName ?? "—";
                  const last = a.applicant.lastName ?? "—";

                  const preferred =
                    a.applicant.displayName ||
                    [a.applicant.firstName, a.applicant.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim() ||
                    "—";

                  const business = a.applicant.businessName ?? "—";

                  const notes = a.organizerNotes || "—";

                  const appEmail =
                    a.applicant.email ??
                    (emailKey
                      ? (a.answers?.[emailKey] as string | undefined)
                      : undefined) ??
                    "—";

                  
                  const appLocation =
                    a.applicant.location ??
                    (locationKey
                      ? (a.answers?.[locationKey] as string | undefined)
                      : undefined) ??
                    "—";

                  const thumb =
                    a.konfolio.thumbnailUrl ??
                    (a.konfolio as any).thumbnail_url ??
                    null;

                  const applicantBusinessSlug =
                    a.applicant.businessSlug ?? a.applicant.business_slug ?? null;
                  const konfolioPortfolioSlug =
                    a.konfolio.portfolioSlug ?? a.konfolio.portfolio_slug ?? null;
                  const publicKonfolioHref =
                    applicantBusinessSlug && konfolioPortfolioSlug
                      ? `/${applicantBusinessSlug}/${konfolioPortfolioSlug}`
                      : null;

                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedApp(a)}
                      className="border-b border-zinc-100 hover:bg-zinc-50/60"
                    >
                      <td className="sticky left-0 z-10 bg-white px-4 py-5 text-zinc-500">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-5 text-zinc-500 whitespace-nowrap">
                        {formatTimeSubmitted(a.createdAt)}
                      </td>

                      <td className="px-4 py-5 text-zinc-400 truncate">
                        {notes}
                      </td>

                      <td
                        className="px-4 py-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1.5">
                          <select
                            value={a.status}
                            disabled={updatingId === a.id}
                            onChange={(e) =>
                              handleStatusChange(a.id, e.target.value as any)
                            }
                            className="appearance-none bg-transparent pr-6 text-sm text-zinc-800 outline-none"
                            aria-label={`Status for row ${idx + 1}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <span className="ml-[-18px] pointer-events-none text-zinc-400">
                            ▾
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">{first}</td>
                      <td className="px-4 py-5">{last}</td>
                      <td className="px-4 py-5">{preferred}</td>
                      <td className="px-4 py-5">{business}</td>

                      <td className="px-4 py-5 truncate">{String(appEmail)}</td>
                      <td className="px-4 py-5 truncate">
                        {String(appLocation)}
                      </td>

                      <td
                        className="px-4 py-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {publicKonfolioHref ? (
                          <Link
                            href={publicKonfolioHref}
                            className="inline-flex"
                            aria-label="Open applicant konfolio"
                          >
                            <div className="h-12 w-12 rounded-lg bg-zinc-200 overflow-hidden shadow-sm">
                              {thumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={thumb}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (
                                      e.currentTarget as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full grid place-items-center text-[11px] text-zinc-500">
                                  —
                                </div>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-zinc-200 overflow-hidden shadow-sm grid place-items-center text-[11px] text-zinc-500">
                            —
                          </div>
                        )}
                      </td>

                      <td className="px-2 py-5 text-center text-zinc-300" />

                      <td
                        className="px-2 py-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-500"
                          aria-label="More actions"
                          onClick={() => {}}
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 text-sm text-zinc-500">
            <div>
              Showing{" "}
              <span className="text-zinc-700">
                {apps.length.toLocaleString()}
              </span>{" "}
              of{" "}
              <span className="text-zinc-700">
                {totalCount.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-zinc-700 hover:bg-zinc-50"
              onClick={onReload}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      {selectedApp && (
        <ApplicationDrawer
          key={selectedApp?.id}
          app={selectedApp}
          position={{
            index: apps.findIndex((a) => a.id === selectedApp.id),
            total: apps.length,
          }}
          onUpdate={(updates) => handleDrawerUpdate(selectedApp.id, updates)}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </>
  );
}
