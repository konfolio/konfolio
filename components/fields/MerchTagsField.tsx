"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { keyifyMerchLabel, normalizeMerchLabel } from "@/lib/merchCategories";

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

      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] flex items-center justify-between text-left outline-none focus:border-[#C0BDB4]"
        >
          <span
            className={`text-[14px] truncate ${selected.length > 0 ? "text-[#262626]" : "text-[#A5A5A5]"}`}
          >
            {selected.length > 0 ? selected.join(", ") : "Select"}
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
              stroke="#C0BDB4"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-[52px] w-full max-w-[397px] bg-white border border-[#E9E9E9] rounded-[10px] shadow-[5px_5px_25px_rgba(0,0,0,0.08)] p-[10px] z-50">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-[40px] rounded-[8px] border border-[#E9E9E9] bg-white px-[10px] text-[14px] text-[#262626] outline-none focus:border-[#C0BDB4]"
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
                      className={`w-full text-left px-[8px] py-[8px] rounded-[6px] hover:bg-[#F7F7F7] text-[14px] text-[#262626] ${isSelected ? "bg-[#F7F7F7]" : ""}`}
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

      {pool.length > 0 && (
        <div className="flex flex-wrap gap-[10px] pt-[2px]">
          {pool.map((tag) => {
            const isSelected = selectedSet.has(keyifyMerchLabel(tag));
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`h-[40px] px-[18px] rounded-full border text-[14px] transition-colors ${
                  isSelected
                    ? "border-[#262626] bg-[#262626] text-white"
                    : "border-[#E9E9E9] bg-white text-[#262626] hover:border-[#C0BDB4]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
