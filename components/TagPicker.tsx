"use client";

import { useState } from "react";

const AVAILABLE_TAGS = [
  "No AI",
  "Tables Provided",
  "Chairs Provided",
  "Refreshments Provided",
  "Single-Day Okay",
  "Original Art Only",
  "Fan Art Restricted",
  "NSFW Not Allowed",
  "NSFW - Restricted Area",
  "No Commercial Items",
  "No Resale",
];

export default function TagPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (tag: string) => {
    const next = selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag];
    onChange(next);
  };

  return (
    <div className="relative self-start">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-[32px] px-[16px] rounded-full border border-[#E9E9E9] text-[13px] text-[#A5A5A5] hover:opacity-70 flex items-center gap-[6px]"
      >
        {selected.length > 0 ? (
          <span className="text-[#262626]">
            {selected.length} tag{selected.length !== 1 ? "s" : ""}
          </span>
        ) : (
          <span>+ Tag</span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[36px] z-20 bg-[#1C1C1C] rounded-[14px] overflow-hidden min-w-[240px] shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            <div className="px-[16px] py-[8px] flex items-center justify-between border-b border-white/10">
              <span className="text-[12px] text-white/50">Add Tag</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[12px] text-white/50 hover:text-white"
              >
                Expand
              </button>
            </div>
            {AVAILABLE_TAGS.map((tag) => {
              const checked = selected.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggle(tag)}
                  className="w-full flex items-center gap-[12px] px-[16px] py-[10px] text-[14px] text-white hover:bg-white/10 text-left"
                >
                  <span className="w-[16px] shrink-0 text-white">
                    {checked ? "✓" : ""}
                  </span>
                  {tag}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
