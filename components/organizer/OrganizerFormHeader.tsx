"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Order, StatusFilter } from "./ApplicationsTable";

type FormMeta = {
  id: string;
  title?: string | null;
  status?: string | null;
  organizer_id?: string | null;
};

type NoticeDateField = { key: string; label: string };

function prettyStatus(status?: string | null) {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusDotColor(status?: string | null) {
  switch (status) {
    case "receiving":
      return "bg-emerald-500";
    case "closed":
      return "bg-rose-500";
    case "draft":
    default:
      return "bg-zinc-400";
  }
}

const STATUS_OPTIONS: { value: Exclude<StatusFilter, "all">; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accept" },
  { value: "rejected", label: "Reject" },
];

function statusChipLabel(value: StatusFilter) {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function OrganizerFormHeader({
  formId,
  appCount,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  order,
  onOrderChange,
  locationOptions,
  locationFilter,
  onLocationFilterChange,
  merchOptions,
  merchFilter,
  onMerchFilterChange,
  noticeDateField,
  noticeDateFilter,
  onNoticeDateFilterChange,
}: {
  formId: string;
  appCount: number;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  order: Order;
  onOrderChange: (value: Order) => void;
  locationOptions: string[];
  locationFilter: string[];
  onLocationFilterChange: (value: string[]) => void;
  merchOptions: string[];
  merchFilter: string[];
  onMerchFilterChange: (value: string[]) => void;
  noticeDateField: NoticeDateField | null;
  noticeDateFilter: string | null;
  onNoticeDateFilterChange: (value: string | null) => void;
}) {
  const [form, setForm] = useState<FormMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const formRes = await fetch(`/api/forms/${formId}`, {
          cache: "no-store",
        });
        const formJson = await formRes.json().catch(() => ({}));

        if (cancelled) return;

        setForm(formRes.ok ? formJson.form : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [formId]);

  function toggleLocation(value: string) {
    onLocationFilterChange(
      locationFilter.includes(value)
        ? locationFilter.filter((v) => v !== value)
        : [...locationFilter, value],
    );
  }

  function toggleMerch(value: string) {
    onMerchFilterChange(
      merchFilter.includes(value)
        ? merchFilter.filter((v) => v !== value)
        : [...merchFilter, value],
    );
  }

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (statusFilter !== "all") {
      chips.push({
        key: `status:${statusFilter}`,
        label: statusChipLabel(statusFilter),
        onRemove: () => onStatusFilterChange("all"),
      });
    }

    for (const loc of locationFilter) {
      chips.push({
        key: `location:${loc}`,
        label: loc,
        onRemove: () => toggleLocation(loc),
      });
    }

    for (const tag of merchFilter) {
      chips.push({
        key: `merch:${tag}`,
        label: tag,
        onRemove: () => toggleMerch(tag),
      });
    }

    if (noticeDateFilter) {
      chips.push({
        key: "noticeDate",
        label: noticeDateFilter,
        onRemove: () => onNoticeDateFilterChange(null),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, locationFilter, merchFilter, noticeDateFilter]);

  const visibleChips = activeChips.slice(0, 3);
  const extraChipCount = activeChips.length - visibleChips.length;
  const hasActiveFilters = activeChips.length > 0 || order !== "time_submitted";

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
                <span
                  className={`inline-block h-2 w-2 rounded-full ${statusDotColor(form?.status)}`}
                />
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
              placeholder="Search applicants"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-56 rounded-full border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
            />
            <span className="absolute left-3 top-2.5 text-zinc-400">⌕</span>
          </div>

          {visibleChips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {chip.label}
              <span className="text-zinc-400">×</span>
            </button>
          ))}

          {extraChipCount > 0 && (
            <button
              onClick={() => setFilterOpen(true)}
              className="h-9 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              +{extraChipCount}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              aria-label="Open filters"
              aria-expanded={filterOpen}
              className={`relative h-9 w-9 rounded-full border hover:bg-zinc-50 ${
                filterOpen
                  ? "border-zinc-400 bg-zinc-50"
                  : "border-zinc-200"
              }`}
            >
              ⏷
              {hasActiveFilters && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-zinc-800" />
              )}
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-11 z-40 flex divide-x divide-zinc-100 rounded-2xl border border-zinc-200 bg-white p-5 text-sm shadow-xl">
                  {/* Order */}
                  <div className="flex w-40 flex-col gap-3 pr-5">
                    <p className="font-medium text-zinc-800">Order</p>
                    <div className="flex flex-col gap-2">
                      {(
                        [
                          { value: "time_submitted", label: "Time Submitted" },
                          { value: "alphabetical", label: "Alphabetical" },
                        ] as { value: Order; label: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onOrderChange(opt.value)}
                          className="flex items-center gap-2 text-left text-zinc-600 hover:text-zinc-900"
                        >
                          <span className="w-3 text-zinc-800">
                            {order === opt.value ? "✓" : ""}
                          </span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex w-36 flex-col gap-3 px-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-zinc-800">Status</p>
                      <button
                        aria-label="Clear status filter"
                        onClick={() => onStatusFilterChange("all")}
                        className="text-zinc-400 hover:text-zinc-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() =>
                            onStatusFilterChange(
                              statusFilter === opt.value ? "all" : opt.value,
                            )
                          }
                          className="flex items-center gap-2 text-left text-zinc-600 hover:text-zinc-900"
                        >
                          <span className="w-3 text-zinc-800">
                            {statusFilter === opt.value ? "✓" : ""}
                          </span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex w-48 flex-col gap-3 px-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-zinc-800">Location</p>
                      <button
                        aria-label="Clear location filter"
                        onClick={() => onLocationFilterChange([])}
                        className="text-zinc-400 hover:text-zinc-700"
                      >
                        ×
                      </button>
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) toggleLocation(e.target.value);
                      }}
                      className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-600 outline-none"
                    >
                      <option value="">Select</option>
                      {locationOptions
                        .filter((loc) => !locationFilter.includes(loc))
                        .map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                    </select>
                    <div className="flex flex-col gap-2">
                      {locationFilter.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => toggleLocation(loc)}
                          className="flex items-center gap-2 text-left text-zinc-600 hover:text-zinc-900"
                        >
                          <span className="w-3 text-zinc-800">✓</span>
                          {loc}
                        </button>
                      ))}
                      {locationOptions.length === 0 && (
                        <p className="text-zinc-400">No locations yet</p>
                      )}
                    </div>
                  </div>

                  {/* Merchandise */}
                  <div className="flex w-48 flex-col gap-3 px-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-zinc-800">Merchandise</p>
                      <button
                        aria-label="Clear merchandise filter"
                        onClick={() => onMerchFilterChange([])}
                        className="text-zinc-400 hover:text-zinc-700"
                      >
                        ×
                      </button>
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) toggleMerch(e.target.value);
                      }}
                      className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-600 outline-none"
                    >
                      <option value="">Select</option>
                      {merchOptions
                        .filter((tag) => !merchFilter.includes(tag))
                        .map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {merchFilter.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleMerch(tag)}
                          className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs text-zinc-800"
                        >
                          {tag}
                        </button>
                      ))}
                      {merchOptions.length === 0 && (
                        <p className="text-zinc-400">No tags yet</p>
                      )}
                    </div>
                  </div>

                  {/* Earliest Notice Date */}
                  {noticeDateField && (
                    <div className="flex w-44 flex-col gap-3 pl-5">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-zinc-800">
                          Earliest Notice Date
                        </p>
                        <button
                          aria-label="Clear notice date filter"
                          onClick={() => onNoticeDateFilterChange(null)}
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="date"
                        value={noticeDateFilter ?? ""}
                        onChange={(e) =>
                          onNoticeDateFilterChange(e.target.value || null)
                        }
                        className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-600 outline-none"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-100" />
    </div>
  );
}
