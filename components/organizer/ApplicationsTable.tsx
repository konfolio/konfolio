"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import ApplicationDrawer from "./ApplicationDrawer";
import useClickOutside from "@/components/hooks/useClickOutside";

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
  formTitle,
  loading,
  errorMsg,
  updatingId,
  onStatusChange,
  onDrawerUpdate,
  onReload,
  onDelete,
}: {
  apps: AppRow[];
  totalCount: number;
  fields: Field[];
  formTitle?: string;
  loading: boolean;
  errorMsg: string | null;
  updatingId: string | null;
  onStatusChange: (id: string, status: AppRow["status"]) => void;
  onDrawerUpdate: (id: string, updates: Partial<AppRow>) => void;
  onReload: () => void;
  onDelete: (id: string) => void;
}) {
  const [selectedApp, setSelectedApp] = useState<AppRow | null>(null);

  const [extraFieldKeys, setExtraFieldKeys] = useState<string[]>([]);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const columnPickerRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(columnPickerRef, () => setColumnPickerOpen(false), {
    enabled: columnPickerOpen,
    closeOnEsc: true,
  });

  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(rowMenuRef, () => setRowMenuOpenId(null), {
    enabled: rowMenuOpenId !== null,
    closeOnEsc: true,
  });

  function toggleExtraField(fieldKey: string) {
    setExtraFieldKeys((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((k) => k !== fieldKey)
        : [...prev, fieldKey],
    );
  }

  function handleDelete(id: string) {
    setRowMenuOpenId(null);
    if (!window.confirm("Delete this application? This can't be undone.")) {
      return;
    }
    onDelete(id);
    if (selectedApp?.id === id) setSelectedApp(null);
  }

  function formatAnswer(val: unknown) {
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "—";
    if (val === null || val === undefined || val === "") return "—";
    return String(val);
  }

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

  // Fields already surfaced as their own fixed column — excluded from the
  // "add column" picker so a question can't be shown twice.
  const fixedFieldKeys = useMemo(
    () =>
      new Set(
        [
          "first_name",
          "last_name",
          "preferred_name",
          "business_name",
          emailKey,
          locationKey,
        ].filter(Boolean) as string[],
      ),
    [emailKey, locationKey],
  );

  const pickableFields = useMemo(
    () =>
      [...fields]
        .filter((f) => f.field_key && !fixedFieldKeys.has(f.field_key))
        .sort((a, b) => a.sort_order - b.sort_order),
    [fields, fixedFieldKeys],
  );

  const extraFields = useMemo(
    () =>
      extraFieldKeys
        .map((key) => fields.find((f) => f.field_key === key))
        .filter((f): f is Field => Boolean(f)),
    [extraFieldKeys, fields],
  );

  const totalColumnCount = 11 + extraFields.length + 2;

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
                {extraFields.map((f) => (
                  <col key={f.id} style={{ width: "200px" }} />
                ))}
                <col style={{ width: "44px" }} />
                <col style={{ width: "44px" }} />
              </colgroup>

              <thead className="sticky top-0 z-20">
                <tr className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                  <th className="sticky left-0 z-30 bg-zinc-50 px-4 py-2.5 font-medium text-left">
                    #
                  </th>
                  <th className="px-4 py-2.5 font-medium text-left">
                    Time Submitted
                  </th>
                  <th className="px-4 py-2.5 font-medium text-left">Notes</th>
                  <th className="px-4 py-2.5 font-medium text-left">Status</th>
                  <th className="px-4 py-2.5 font-medium text-left">First</th>
                  <th className="px-4 py-2.5 font-medium text-left">Last</th>
                  <th className="px-4 py-2.5 font-medium text-left">Preferred</th>
                  <th className="px-4 py-2.5 font-medium text-left">Business</th>
                  <th className="px-4 py-2.5 font-medium text-left">Email</th>
                  <th className="px-4 py-2.5 font-medium text-left">Location</th>
                  <th className="px-4 py-2.5 font-medium text-left">Konfolio</th>

                  {extraFields.map((f) => (
                    <th
                      key={f.id}
                      className="px-4 py-2.5 font-medium text-left"
                    >
                      <div className="flex items-center justify-between gap-[8px]">
                        <span className="truncate">{f.label}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${f.label} column`}
                          onClick={() => toggleExtraField(f.field_key)}
                          className="shrink-0 text-zinc-400 hover:text-zinc-700"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}

                  <th className="relative px-2 py-2.5 text-center">
                    <button
                      className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-600"
                      aria-label="Add column"
                      onClick={() => setColumnPickerOpen((v) => !v)}
                    >
                      +
                    </button>

                    {columnPickerOpen && (
                      <div
                        ref={columnPickerRef}
                        className="absolute right-0 top-[44px] z-40 w-[240px] rounded-xl border border-zinc-200 bg-white p-2 text-left font-normal shadow-lg"
                      >
                        <p className="px-2 py-1.5 text-xs text-zinc-400">
                          Show question as column
                        </p>
                        <div className="max-h-[260px] overflow-y-auto">
                          {pickableFields.length === 0 && (
                            <p className="px-2 py-2 text-xs text-zinc-400">
                              No other questions on this form.
                            </p>
                          )}
                          {pickableFields.map((f) => (
                            <label
                              key={f.id}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={extraFieldKeys.includes(f.field_key)}
                                onChange={() => toggleExtraField(f.field_key)}
                              />
                              <span className="truncate">{f.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </th>
                  <th className="px-2 py-2.5" />
                </tr>
              </thead>

              <tbody className="text-zinc-700">
                {loading && (
                  <tr>
                    <td
                      colSpan={totalColumnCount}
                      className="px-4 py-10 text-zinc-500"
                    >
                      Loading…
                    </td>
                  </tr>
                )}

                {!loading && apps.length === 0 && (
                  <tr>
                    <td
                      colSpan={totalColumnCount}
                      className="px-4 py-10 text-zinc-500"
                    >
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
                      <td className="sticky left-0 z-10 bg-white px-4 py-2.5 text-zinc-500">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">
                        {formatTimeSubmitted(a.createdAt)}
                      </td>

                      <td className="px-4 py-2.5 text-zinc-400 truncate">
                        {notes}
                      </td>

                      <td
                        className="px-4 py-2.5"
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

                      <td className="px-4 py-2.5">{first}</td>
                      <td className="px-4 py-2.5">{last}</td>
                      <td className="px-4 py-2.5">{preferred}</td>
                      <td className="px-4 py-2.5">{business}</td>

                      <td className="px-4 py-2.5 truncate">{String(appEmail)}</td>
                      <td className="px-4 py-2.5 truncate">
                        {String(appLocation)}
                      </td>

                      <td
                        className="px-4 py-2.5"
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

                      {extraFields.map((f) => (
                        <td key={f.id} className="px-4 py-2.5 truncate">
                          {formatAnswer(a.answers?.[f.field_key])}
                        </td>
                      ))}

                      <td className="px-2 py-2.5 text-center text-zinc-300" />

                      <td
                        className="relative px-2 py-2.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-500"
                          aria-label="More actions"
                          onClick={() =>
                            setRowMenuOpenId((prev) =>
                              prev === a.id ? null : a.id,
                            )
                          }
                        >
                          ⋮
                        </button>

                        {rowMenuOpenId === a.id && (
                          <div
                            ref={rowMenuRef}
                            className="absolute right-2 top-[44px] z-40 w-[200px] rounded-xl border border-zinc-200 bg-white p-1 text-left shadow-lg"
                          >
                            {publicKonfolioHref ? (
                              <Link
                                href={publicKonfolioHref}
                                target="_blank"
                                onClick={() => setRowMenuOpenId(null)}
                                className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                              >
                                Open portfolio
                              </Link>
                            ) : (
                              <span className="block px-3 py-2 text-sm text-zinc-300">
                                Open portfolio
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(a.id)}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                            >
                              Delete application
                            </button>
                          </div>
                        )}
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
          formTitle={formTitle}
          fields={fields}
          allApplicants={apps}
          onSelectApplicant={(a) => setSelectedApp(a)}
          onUpdate={(updates) => handleDrawerUpdate(selectedApp.id, updates)}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </>
  );
}
