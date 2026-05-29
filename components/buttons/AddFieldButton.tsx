"use client";

import { useState } from "react";

export const FIELD_TYPES = [
  {
    type: "plain_text",
    label: "Plain Text",
    description: "Add a text block or instructions for applicants.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M2 7h8M2 10h10M2 13h6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "short_text",
    label: "Text",
    description:
      "Short answer text, ideal for names, titles, or brief responses.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M2 8h8M2 12h6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "long_text",
    label: "Long Text",
    description:
      "Long answer text, suitable for descriptions, explanations, or detailed responses.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 3h12M2 6.5h12M2 10h12M2 13.5h7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "radio",
    label: "Multiple Choice",
    description: "Respondents can select one option from a list of choices.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="4" cy="11" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M8 5h6M8 11h6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "checkbox",
    label: "Checklist",
    description:
      "Respondents can select multiple options from a list of choices.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3.5"
          width="4"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <rect
          x="2"
          y="9.5"
          width="4"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M8 5.5h6M8 11.5h6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Respondents can select one option from a dropdown menu.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="4"
          width="12"
          height="8"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M6 8l2 2 2-2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    type: "date",
    label: "Date",
    description: "Respondents can select a date from a calendar view.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3"
          width="12"
          height="11"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M5 2v2M11 2v2M2 7h12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "image",
    label: "Image Upload",
    description: "Applicants can upload an image file.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="1.5"
          y="3.5"
          width="13"
          height="10"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle
          cx="5.5"
          cy="7"
          r="1.2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M1.5 11l3.5-2.5 2.5 2 2-1.5 4 3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function AddFieldButton({
  onAdd,
}: {
  onAdd: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative self-start">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-[40px] px-[20px] rounded-full border border-[#E9E9E9] text-[14px] text-[#A5A5A5] hover:opacity-70 flex items-center gap-[6px]"
      >
        <span>+</span>
        <span>Add Question</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[44px] z-20 bg-white rounded-[12px] border border-[#E9E9E9] shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden min-w-[200px]">
            {FIELD_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => {
                  onAdd(type);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-[10px] px-[16px] py-[10px] text-[13px] text-[#262626] hover:bg-[#F7F7F7] text-left"
              >
                <span className="text-[#A5A5A5]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
