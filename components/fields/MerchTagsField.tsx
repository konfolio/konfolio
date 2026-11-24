"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  keyifyMerchLabel,
  normalizeMerchLabel,
  splitLowAccuracy,
  MERCH_ROWS,
  type MerchRow,
} from "@/lib/merchCategories";
import DeleteIcon from "@/components/icons/DeleteIcon";
import PlusIcon from "@/components/icons/PlusIcon";

export default function MerchTagsField({
  label,
  options,
  value,
  onChange,
}: {
  label: React.ReactNode;
  options?: string[];
  value: any;
  onChange: (val: string[]) => void;
}) {
  // The organizer's own configured options surface as a "Commonly
  // Selected" quick-add shortcut — the browsable/searchable pool itself
  // is always the full merch category list, same as everywhere else in
  // the app (MerchTagPicker).
  const commonlySelected = options ?? [];
  const selected: string[] = Array.isArray(value) ? value : [];
  const selectedSet = useMemo(
    () => new Set(selected.map(keyifyMerchLabel)),
    [selected],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const addTag = (raw: string) => {
    const tag = normalizeMerchLabel(raw);
    if (!tag) return;
    const k = keyifyMerchLabel(tag);
    if (selectedSet.has(k)) return;
    onChange([...selected, tag]);
  };

  const removeTag = (raw: string) => {
    const k = keyifyMerchLabel(raw);
    onChange(selected.filter((t) => keyifyMerchLabel(t) !== k));
  };

  const pickOption = (label: string) => {
    addTag(label);
    setQuery("");
  };

  const visibleCommonlySelected = useMemo(() => {
    const q = keyifyMerchLabel(query);
    return commonlySelected.filter((opt) => {
      if (selectedSet.has(keyifyMerchLabel(opt))) return false;
      if (q && !keyifyMerchLabel(opt).includes(q)) return false;
      return true;
    });
  }, [commonlySelected, query, selectedSet]);

  const visibleRows = useMemo(() => {
    const q = keyifyMerchLabel(query);
    const out: MerchRow[] = [];
    let currentHeader: MerchRow | null = null;
    let headerAdded = false;

    for (const row of MERCH_ROWS) {
      if (row.type === "header") {
        currentHeader = row;
        headerAdded = false;
        continue;
      }
      if (selectedSet.has(keyifyMerchLabel(row.label))) continue;
      if (q && !keyifyMerchLabel(row.label).includes(q)) continue;

      if (!headerAdded && currentHeader) {
        out.push(currentHeader);
        headerAdded = true;
      }
      out.push(row);
    }
    return out;
  }, [query, selectedSet]);

  const hasAnyMatches =
    visibleCommonlySelected.length > 0 ||
    visibleRows.some((r) => r.type === "item");

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const q = normalizeMerchLabel(query);
    if (!q) return;
    const exact = MERCH_ROWS.find(
      (r) => r.type === "item" && keyifyMerchLabel(r.label) === keyifyMerchLabel(q),
    );
    pickOption(exact && exact.type === "item" ? exact.label : q);
  };

  return (
    <div className="flex flex-col gap-[8px]">
      {label}

      {/* Trigger + browse/search dropdown. Colors, radius, and type match
          the merch tag design system (components/onboarding/Tag.tsx,
          components/my-portfolios/MerchTagPicker.tsx) — this field just
          needs its own full-width trigger since the full category list
          is longer than that widget's small anchored popover. */}
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-[48px] rounded-[10px] border border-[#A5A5A5]/50 bg-white px-[14px] flex items-center justify-between text-left outline-none"
        >
          <span
            className={`font-inter font-normal text-[14px] leading-[140%] truncate ${selected.length > 0 ? "text-[#262626]" : "text-[#A5A5A5]"}`}
          >
            {selected.length > 0 ? `${selected.length} selected` : "Select"}
          </span>
          <svg
            className="shrink-0"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="#A5A5A5"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-[52px] w-full max-w-[397px] bg-white rounded-[15px] shadow-[5px_5px_25px_rgba(0,0,0,0.05)] p-[10px] z-50">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search"
              className="w-full h-[40px] rounded-[10px] border border-[#A5A5A5]/50 bg-white px-[10px] font-inter font-normal text-[14px] leading-[140%] text-[#262626] outline-none placeholder:text-[#A5A5A5]"
            />

            <div className="max-h-[320px] overflow-y-auto pr-[4px] pt-[8px]">
              {visibleCommonlySelected.length > 0 && (
                <>
                  <p className="m-0 px-[8px] pb-[6px] font-inter text-[12px] leading-[140%] text-[#A5A5A5]">
                    Commonly Selected
                  </p>
                  <div className="flex flex-col gap-[6px] pb-[10px]">
                    {visibleCommonlySelected.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => pickOption(opt)}
                        className="flex w-full items-center gap-[7px] rounded-[8px] px-[8px] py-[6px] text-left hover:bg-[#F7F7F7]"
                      >
                        <span className="text-[#A5A5A5] flex items-center justify-center">
                          <PlusIcon />
                        </span>
                        <span className="font-inter text-[14px] leading-[140%] text-[#262626]">
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {!hasAnyMatches ? (
                <p className="px-[8px] py-[8px] text-[13px] text-[#A5A5A5]">
                  No matches.
                </p>
              ) : (
                <div className="flex flex-col">
                  {visibleRows.map((row, idx) => {
                    if (row.type === "header") {
                      return (
                        <div
                          key={`h-${row.label}-${idx}`}
                          className="px-[8px] pt-[10px] pb-[6px] font-inter font-normal text-[12px] leading-[140%] text-[#A5A5A5]"
                        >
                          {row.label}
                        </div>
                      );
                    }
                    const { base, isLow } = splitLowAccuracy(row.label);
                    return (
                      <button
                        key={`i-${row.label}-${idx}`}
                        type="button"
                        onClick={() => pickOption(row.label)}
                        className="flex w-full items-center justify-between gap-[10px] rounded-[8px] px-[8px] py-[8px] text-left hover:bg-[#F7F7F7]"
                      >
                        <span className="font-inter text-[14px] leading-[140%] text-[#262626]">
                          {base}
                        </span>
                        {isLow && (
                          <span className="whitespace-nowrap font-inter font-normal text-[9px] leading-[100%] text-[#A5A5A5]">
                            Low Accuracy
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-[6px] border-t border-[#E9E9E9] pt-[8px]">
              <button
                type="button"
                onClick={() => {
                  const q = normalizeMerchLabel(query);
                  if (q) pickOption(q);
                  else inputRef.current?.focus();
                }}
                className="flex w-full items-center gap-[7px] rounded-[8px] px-[8px] py-[6px] text-left hover:bg-[#F7F7F7]"
              >
                <span className="text-[#A5A5A5] flex items-center justify-center">
                  <PlusIcon />
                </span>
                <span className="font-inter text-[14px] leading-[140%] text-[#262626]">
                  {normalizeMerchLabel(query)
                    ? `Add "${normalizeMerchLabel(query)}"`
                    : "Add a tag"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-[10px] pt-[2px]">
          {selected.map((tag) => (
            <div key={tag} className="relative group">
              <div className="inline-flex h-[24px] items-center justify-center gap-[7px] whitespace-nowrap rounded-full border border-[#A5A5A5]/50 px-[22px] py-[7px] font-inter font-normal text-[14px] leading-[140%] text-[#262626]">
                {tag}
              </div>
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}
                className="absolute right-[-5.25px] top-1/2 z-10 flex h-[17.25px] w-[17.25px] -translate-y-1/2 items-center justify-center rounded-full bg-[#A5A5A5] text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <DeleteIcon className="h-[13.42px] w-[13.42px] cursor-pointer" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
