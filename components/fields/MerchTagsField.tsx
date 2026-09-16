"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { keyifyMerchLabel, normalizeMerchLabel } from "@/lib/merchCategories";
import DeleteIcon from "@/components/icons/DeleteIcon";

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
  const pool = options ?? [];
  const selected: string[] = Array.isArray(value) ? value : [];
  const selectedSet = useMemo(
    () => new Set(selected.map(keyifyMerchLabel)),
    [selected],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

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

  const toggleTag = (raw: string) => {
    const tag = normalizeMerchLabel(raw);
    if (!tag) return;
    const k = keyifyMerchLabel(tag);
    if (selectedSet.has(k)) {
      onChange(selected.filter((t) => keyifyMerchLabel(t) !== k));
    } else {
      onChange([...selected, tag]);
    }
  };

  const visibleOptions = useMemo(() => {
    const q = keyifyMerchLabel(query);
    if (!q) return pool;
    return pool.filter((opt) => keyifyMerchLabel(opt).includes(q));
  }, [pool, query]);

  return (
    <div className="flex flex-col gap-[8px]">
      {label}

      {/* Trigger + browse/search dropdown. Colors, radius, and type match
          the merch tag design system (components/onboarding/Tag.tsx,
          components/my-portfolios/MerchTagPicker.tsx) — this field just
          needs its own full-width trigger since an organizer's option
          list can run longer than that widget's small anchored popover. */}
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-[40px] rounded-[10px] border border-[#A5A5A5]/50 bg-white px-[10px] font-inter font-normal text-[14px] leading-[140%] text-[#262626] outline-none placeholder:text-[#A5A5A5]"
            />
            <div className="max-h-[230px] overflow-y-auto pr-[4px] pt-[8px]">
              {visibleOptions.length === 0 ? (
                <p className="px-[8px] py-[8px] text-[13px] text-[#A5A5A5]">
                  {pool.length === 0
                    ? "The organizer hasn't set up merchandise categories yet."
                    : "No matches."}
                </p>
              ) : (
                visibleOptions.map((opt) => {
                  const isSelected = selectedSet.has(keyifyMerchLabel(opt));
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleTag(opt)}
                      className={`w-full text-left px-[8px] py-[8px] rounded-[8px] hover:bg-[#F7F7F7] font-inter text-[14px] leading-[140%] text-[#262626] ${isSelected ? "bg-[#F7F7F7]" : ""}`}
                    >
                      {opt}
                    </button>
                  );
                })
              )}
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
                onClick={() => toggleTag(tag)}
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
