"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

type ColumnKind = "field" | "notes" | "dropdown" | "divider";

type ColumnConfig = {
  id: string;
  kind: ColumnKind;
  fieldKey?: string;
  label: string;
  hidden: boolean;
  locked: boolean;
  options?: string[];
};

const HIGHLIGHT_COLORS: { key: string; label: string; swatch: string; tint: string }[] = [
  { key: "red", label: "Red", swatch: "#F5A3A3", tint: "#FDEDED" },
  { key: "orange", label: "Orange", swatch: "#F3C08A", tint: "#FDF2E7" },
  { key: "yellow", label: "Yellow", swatch: "#EEE28C", tint: "#FCFAE6" },
  { key: "green", label: "Green", swatch: "#A6D9A6", tint: "#EEF8EE" },
  { key: "blue", label: "Blue", swatch: "#A9C7EE", tint: "#EBF2FC" },
  { key: "purple", label: "Purple", swatch: "#D2B6EA", tint: "#F6EFFB" },
];

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `col_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

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
  formId,
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
  formId: string;
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

  // ---- Column configuration (extra question / notes / dropdown / divider columns) ----
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [customValues, setCustomValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const columnsHydrated = useRef(false);
  const columnsStorageKey = `konfolio_app_columns_${formId}`;
  const valuesStorageKey = `konfolio_app_column_values_${formId}`;

  useEffect(() => {
    if (columnsHydrated.current || !formId) return;
    columnsHydrated.current = true;
    try {
      const rawColumns = localStorage.getItem(columnsStorageKey);
      // localStorage isn't available during SSR, so this has to hydrate
      // post-mount rather than via a useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawColumns) setColumns(JSON.parse(rawColumns));
      const rawValues = localStorage.getItem(valuesStorageKey);
      if (rawValues) setCustomValues(JSON.parse(rawValues));
    } catch {
      // ignore malformed local storage
    }
  }, [formId, columnsStorageKey, valuesStorageKey]);

  useEffect(() => {
    if (!columnsHydrated.current) return;
    try {
      localStorage.setItem(columnsStorageKey, JSON.stringify(columns));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [columns, columnsStorageKey]);

  useEffect(() => {
    if (!columnsHydrated.current) return;
    try {
      localStorage.setItem(valuesStorageKey, JSON.stringify(customValues));
    } catch {
      // ignore storage errors
    }
  }, [customValues, valuesStorageKey]);

  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const columnPickerRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(columnPickerRef, () => setColumnPickerOpen(false), {
    enabled: columnPickerOpen,
    closeOnEsc: true,
  });

  const [columnMenuOpenId, setColumnMenuOpenId] = useState<string | null>(
    null,
  );
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(columnMenuRef, () => setColumnMenuOpenId(null), {
    enabled: columnMenuOpenId !== null,
    closeOnEsc: true,
  });

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(rowMenuRef, () => setRowMenuOpenId(null), {
    enabled: rowMenuOpenId !== null,
    closeOnEsc: true,
  });
  const [highlightSubmenuOpen, setHighlightSubmenuOpen] = useState(false);

  // ---- Row state (highlight / hide) ----
  const [rowHighlights, setRowHighlights] = useState<Record<string, string>>(
    {},
  );
  const [hiddenRowIds, setHiddenRowIds] = useState<Record<string, boolean>>(
    {},
  );
  const [showHiddenRows, setShowHiddenRows] = useState(false);
  const rowStateHydrated = useRef(false);
  const rowStateStorageKey = `konfolio_app_row_state_${formId}`;

  useEffect(() => {
    if (rowStateHydrated.current || !formId) return;
    rowStateHydrated.current = true;
    try {
      const raw = localStorage.getItem(rowStateStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // localStorage isn't available during SSR, so this has to hydrate
        // post-mount rather than via a useState initializer.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRowHighlights(parsed.highlights ?? {});
        setHiddenRowIds(parsed.hidden ?? {});
      }
    } catch {
      // ignore malformed local storage
    }
  }, [formId, rowStateStorageKey]);

  useEffect(() => {
    if (!rowStateHydrated.current) return;
    try {
      localStorage.setItem(
        rowStateStorageKey,
        JSON.stringify({ highlights: rowHighlights, hidden: hiddenRowIds }),
      );
    } catch {
      // ignore storage errors
    }
  }, [rowHighlights, hiddenRowIds, rowStateStorageKey]);

  function setRowHighlight(appId: string, colorKey: string | null) {
    setRowHighlights((prev) => {
      const next = { ...prev };
      if (colorKey) next[appId] = colorKey;
      else delete next[appId];
      return next;
    });
  }

  function setRowHidden(appId: string, hidden: boolean) {
    setHiddenRowIds((prev) => {
      const next = { ...prev };
      if (hidden) next[appId] = true;
      else delete next[appId];
      return next;
    });
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

  // All questions are shown by default. Once fields load, seed a column for
  // any pickable field that doesn't have a column yet (new form questions
  // added later also get appended automatically), without touching columns
  // the organizer has already customized (renamed/hidden/reordered/etc).
  // Done during render (React's "adjust state from props" pattern) rather
  // than in an effect, guarded by state (not a ref, which can't be written
  // during render) so it only runs when the set of pickable fields changes.
  const [mergedFieldKeysSignature, setMergedFieldKeysSignature] =
    useState("");
  const pickableFieldKeysSignature = pickableFields
    .map((f) => f.field_key)
    .join("|");
  if (
    pickableFields.length > 0 &&
    mergedFieldKeysSignature !== pickableFieldKeysSignature
  ) {
    setMergedFieldKeysSignature(pickableFieldKeysSignature);
    const known = new Set(
      columns.filter((c) => c.kind === "field").map((c) => c.fieldKey),
    );
    const missing = pickableFields.filter((f) => !known.has(f.field_key));
    if (missing.length > 0) {
      setColumns((prev) => [
        ...prev,
        ...missing.map((f) => ({
          id: `field-${f.field_key}`,
          kind: "field" as const,
          fieldKey: f.field_key,
          label: f.label,
          hidden: false,
          locked: false,
        })),
      ]);
    }
  }

  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns],
  );
  const hiddenColumns = useMemo(
    () => columns.filter((c) => c.hidden),
    [columns],
  );

  // Existing questions not yet turned into a column at all (visible or hidden).
  const addableFields = useMemo(() => {
    const known = new Set(columns.map((c) => c.fieldKey).filter(Boolean));
    return pickableFields.filter((f) => !known.has(f.field_key));
  }, [pickableFields, columns]);

  function addFieldColumn(field: Field) {
    setColumns((prev) => [
      ...prev,
      {
        id: `field-${field.field_key}`,
        kind: "field",
        fieldKey: field.field_key,
        label: field.label,
        hidden: false,
        locked: false,
      },
    ]);
    setColumnPickerOpen(false);
  }

  function addCustomColumn(kind: "notes" | "dropdown" | "divider", afterId?: string) {
    let options: string[] | undefined;
    if (kind === "dropdown") {
      const raw = window.prompt(
        "Dropdown options, separated by commas:",
        "Option 1, Option 2",
      );
      if (raw === null) return;
      options = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const newColumn: ColumnConfig = {
      id: uid(),
      kind,
      label:
        kind === "notes" ? "Notes" : kind === "dropdown" ? "Dropdown" : "",
      hidden: false,
      locked: false,
      options,
    };
    setColumns((prev) => {
      if (!afterId) return [...prev, newColumn];
      const idx = prev.findIndex((c) => c.id === afterId);
      if (idx === -1) return [...prev, newColumn];
      const next = [...prev];
      next.splice(idx + 1, 0, newColumn);
      return next;
    });
    setColumnPickerOpen(false);
    setColumnMenuOpenId(null);
  }

  function toggleColumnHidden(id: string) {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c)),
    );
  }

  function toggleColumnLocked(id: string) {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)),
    );
    setColumnMenuOpenId(null);
  }

  function copyColumn(id: string) {
    setColumns((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copyId = uid();
      const copy: ColumnConfig = {
        ...source,
        id: copyId,
        label: `${source.label} (copy)`,
        locked: false,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      if (source.kind !== "field") {
        setCustomValues((prevValues) => ({
          ...prevValues,
          [copyId]: { ...(prevValues[source.id] ?? {}) },
        }));
      }
      return next;
    });
    setColumnMenuOpenId(null);
  }

  function moveColumn(id: string, direction: -1 | 1) {
    setColumns((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const swapWith = idx + direction;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }

  function deleteColumn(id: string) {
    if (
      !window.confirm(
        "Delete this column? Any notes or dropdown values entered in it will be lost.",
      )
    ) {
      return;
    }
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setCustomValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setColumnMenuOpenId(null);
  }

  function startRename(column: ColumnConfig) {
    setEditingColumnId(column.id);
    setEditingLabel(column.label);
    setColumnMenuOpenId(null);
  }

  function commitRename() {
    if (editingColumnId) {
      const label = editingLabel.trim();
      setColumns((prev) =>
        prev.map((c) =>
          c.id === editingColumnId && label ? { ...c, label } : c,
        ),
      );
    }
    setEditingColumnId(null);
  }

  function setCustomValue(columnId: string, appId: string, value: string) {
    setCustomValues((prev) => ({
      ...prev,
      [columnId]: { ...(prev[columnId] ?? {}), [appId]: value },
    }));
  }

  const totalColumnCount = 11 + visibleColumns.length + 2;

  const visibleApps = useMemo(
    () => (showHiddenRows ? apps : apps.filter((a) => !hiddenRowIds[a.id])),
    [apps, hiddenRowIds, showHiddenRows],
  );
  const hiddenRowCount = apps.filter((a) => hiddenRowIds[a.id]).length;

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
                {visibleColumns.map((c) => (
                  <col
                    key={c.id}
                    style={{ width: c.kind === "divider" ? "24px" : "200px" }}
                  />
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

                  {visibleColumns.map((c) => {
                    const colIndex = columns.findIndex((x) => x.id === c.id);
                    return (
                      <th
                        key={c.id}
                        className="relative px-4 py-2.5 font-medium text-left"
                      >
                        {c.kind === "divider" ? (
                          <div className="mx-auto h-4 w-px bg-zinc-300" />
                        ) : editingColumnId === c.id ? (
                          <input
                            autoFocus
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") setEditingColumnId(null);
                            }}
                            className="w-full rounded-md border border-zinc-300 px-1.5 py-0.5 text-[13px] font-medium text-zinc-800 outline-none"
                          />
                        ) : (
                          <div className="flex items-center justify-between gap-[8px]">
                            <span className="truncate">{c.label}</span>
                            <button
                              type="button"
                              aria-label={`${c.label} column options`}
                              onClick={() =>
                                setColumnMenuOpenId((prev) =>
                                  prev === c.id ? null : c.id,
                                )
                              }
                              className="shrink-0 text-zinc-400 hover:text-zinc-700"
                            >
                              ⋮
                            </button>
                          </div>
                        )}

                        {columnMenuOpenId === c.id && (
                          <div
                            ref={columnMenuRef}
                            className="absolute left-0 top-[38px] z-40 w-[190px] rounded-xl border border-zinc-200 bg-white p-1 text-left font-normal shadow-lg"
                          >
                            <button
                              type="button"
                              disabled={c.locked}
                              onClick={() => startRename(c)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                            >
                              Edit Name
                            </button>
                            <button
                              type="button"
                              disabled={c.locked}
                              onClick={() => {
                                toggleColumnHidden(c.id);
                                setColumnMenuOpenId(null);
                              }}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                            >
                              Hide
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleColumnLocked(c.id)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              {c.locked ? "Unlock" : "Lock"}
                            </button>
                            <button
                              type="button"
                              disabled={c.locked}
                              onClick={() => copyColumn(c.id)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                            >
                              Copy Fields
                            </button>

                            <div className="my-1 border-t border-zinc-100" />

                            <button
                              type="button"
                              disabled={c.locked || colIndex === 0}
                              onClick={() => moveColumn(c.id, -1)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                            >
                              Move Left
                            </button>
                            <button
                              type="button"
                              disabled={c.locked || colIndex === columns.length - 1}
                              onClick={() => moveColumn(c.id, 1)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                            >
                              Move Right
                            </button>
                            <button
                              type="button"
                              onClick={() => addCustomColumn("notes", c.id)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              Add Notes
                            </button>
                            <button
                              type="button"
                              onClick={() => addCustomColumn("dropdown", c.id)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              Add Dropdown
                            </button>
                            <button
                              type="button"
                              onClick={() => addCustomColumn("divider", c.id)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              Add Divider
                            </button>

                            <div className="my-1 border-t border-zinc-100" />

                            <button
                              type="button"
                              onClick={() => deleteColumn(c.id)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}

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
                        <div className="max-h-[200px] overflow-y-auto">
                          {addableFields.length === 0 && (
                            <p className="px-2 py-2 text-xs text-zinc-400">
                              All questions are already columns.
                            </p>
                          )}
                          {addableFields.map((f) => (
                            <button
                              type="button"
                              key={f.id}
                              onClick={() => addFieldColumn(f)}
                              className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        <div className="my-2 border-t border-zinc-100" />
                        <p className="px-2 py-1.5 text-xs text-zinc-400">
                          New column
                        </p>
                        <button
                          type="button"
                          onClick={() => addCustomColumn("notes")}
                          className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          + Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomColumn("dropdown")}
                          className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          + Dropdown
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomColumn("divider")}
                          className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          + Divider
                        </button>

                        {hiddenColumns.length > 0 && (
                          <>
                            <div className="my-2 border-t border-zinc-100" />
                            <p className="px-2 py-1.5 text-xs text-zinc-400">
                              Hidden columns
                            </p>
                            <div className="max-h-[160px] overflow-y-auto">
                              {hiddenColumns.map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-500"
                                >
                                  <span className="truncate">
                                    {c.label || "Divider"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleColumnHidden(c.id)}
                                    className="shrink-0 text-xs text-zinc-500 underline hover:text-zinc-800"
                                  >
                                    Show
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
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

                {!loading && visibleApps.length === 0 && (
                  <tr>
                    <td
                      colSpan={totalColumnCount}
                      className="px-4 py-10 text-zinc-500"
                    >
                      No applications yet.
                    </td>
                  </tr>
                )}

                {visibleApps.map((a, idx) => {
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

                  const highlightKey = rowHighlights[a.id];
                  const highlight = HIGHLIGHT_COLORS.find(
                    (h) => h.key === highlightKey,
                  );
                  const isHidden = Boolean(hiddenRowIds[a.id]);

                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedApp(a)}
                      style={
                        highlight
                          ? { backgroundColor: highlight.tint }
                          : undefined
                      }
                      className={`border-b border-zinc-100 hover:bg-zinc-50/60 ${
                        isHidden ? "opacity-50" : ""
                      }`}
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

                      {visibleColumns.map((c) => (
                        <td
                          key={c.id}
                          className="px-4 py-2.5 truncate"
                          onClick={
                            c.kind === "notes" || c.kind === "dropdown"
                              ? (e) => e.stopPropagation()
                              : undefined
                          }
                        >
                          {c.kind === "field" &&
                            formatAnswer(a.answers?.[c.fieldKey as string])}

                          {c.kind === "notes" && (
                            <input
                              type="text"
                              value={customValues[c.id]?.[a.id] ?? ""}
                              disabled={c.locked}
                              onChange={(e) =>
                                setCustomValue(c.id, a.id, e.target.value)
                              }
                              placeholder="—"
                              className="w-full bg-transparent text-[14px] text-zinc-700 outline-none disabled:opacity-60"
                            />
                          )}

                          {c.kind === "dropdown" && (
                            <select
                              value={customValues[c.id]?.[a.id] ?? ""}
                              disabled={c.locked}
                              onChange={(e) =>
                                setCustomValue(c.id, a.id, e.target.value)
                              }
                              className="w-full bg-transparent text-[14px] text-zinc-700 outline-none disabled:opacity-60"
                            >
                              <option value="">—</option>
                              {(c.options ?? []).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}

                          {c.kind === "divider" && (
                            <div className="mx-auto h-full w-px bg-zinc-200" />
                          )}
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
                          onClick={() => {
                            setHighlightSubmenuOpen(false);
                            setRowMenuOpenId((prev) =>
                              prev === a.id ? null : a.id,
                            );
                          }}
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
                              onClick={() =>
                                setHighlightSubmenuOpen((v) => !v)
                              }
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              Highlight
                              <span className="text-zinc-400">
                                {highlightSubmenuOpen ? "︿" : "﹀"}
                              </span>
                            </button>
                            {highlightSubmenuOpen && (
                              <div className="pb-1">
                                {HIGHLIGHT_COLORS.map((h) => (
                                  <button
                                    key={h.key}
                                    type="button"
                                    onClick={() => {
                                      setRowHighlight(a.id, h.key);
                                      setRowMenuOpenId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 pl-6 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                                  >
                                    <span
                                      className="h-3 w-3 rounded-full border border-black/5"
                                      style={{ backgroundColor: h.swatch }}
                                    />
                                    {h.label}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRowHighlight(a.id, null);
                                    setRowMenuOpenId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 pl-6 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                                >
                                  <span className="h-3 w-3 rounded-full border border-zinc-300" />
                                  None
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setRowHidden(a.id, !isHidden);
                                setRowMenuOpenId(null);
                              }}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              {isHidden ? "Unhide" : "Hide"}
                            </button>

                            <div className="my-1 border-t border-zinc-100" />

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
            <div className="flex items-center gap-3">
              <span>
                Showing{" "}
                <span className="text-zinc-700">
                  {visibleApps.length.toLocaleString()}
                </span>{" "}
                of{" "}
                <span className="text-zinc-700">
                  {totalCount.toLocaleString()}
                </span>
              </span>
              {hiddenRowCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHiddenRows((v) => !v)}
                  className="text-zinc-500 underline hover:text-zinc-800"
                >
                  {showHiddenRows
                    ? "Hide hidden rows"
                    : `Show ${hiddenRowCount} hidden`}
                </button>
              )}
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
