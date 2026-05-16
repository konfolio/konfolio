"use client";

import Navbar from "@/components/Navbar";
import PublishFormModal from "@/components/modals/PublishFormModal";
import SetLimitModal from "@/components/modals/SetLimitModal";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const FIELD_TYPES = [
  {
    type: "short_text",
    label: "Text",
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
];

function AddFieldButton({ onAdd }: { onAdd: (type: string) => void }) {
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

function AddFieldModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[16px] w-full max-w-[480px] px-[32px] py-[32px] relative shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[20px] text-[#A5A5A5] hover:text-[#262626]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h3 className="text-[16px] font-medium text-[#262626] mb-[20px]">
          Add a question
        </h3>

        <div className="flex flex-col gap-[8px]">
          {FIELD_TYPES.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              className="flex items-center gap-[14px] px-[16px] py-[12px] rounded-[10px] border border-[#E9E9E9] hover:border-[#C0BDB4] hover:bg-[#F7F7F7] text-left"
            >
              <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F7F7F7] flex items-center justify-center shrink-0">
                {type === "short_text" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 5h12M2 8h8M2 11h10"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "long_text" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4h12M2 7h12M2 10h12M2 13h6"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "radio" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="5"
                      cy="5"
                      r="2.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <circle
                      cx="5"
                      cy="11"
                      r="2.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M9 5h5M9 11h5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "checkbox" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="3.5"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <rect
                      x="2"
                      y="9.5"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M9 6h5M9 12h5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "dropdown" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="12"
                      height="8"
                      rx="2"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M6 8l2 2 2-2"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {type === "date" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="11"
                      rx="1.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 2v2M11 2v2M2 7h12"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[14px] text-[#262626]">{label}</p>
                <p className="text-[12px] text-[#A5A5A5]">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Fields that cannot be deleted
const PROTECTED_FIELD_KEYS = [
  "first_name",
  "last_name",
  "preferred_name",
  "email",
  "business_name",
];

const DEFAULT_FIELDS = [
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "First Name",
    field_key: "first_name",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 0,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Last Name",
    field_key: "last_name",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 1,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Preferred Name",
    field_key: "preferred_name",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 2,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Business Name",
    field_key: "business_name",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 3,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Email",
    field_key: "email",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 4,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Location",
    field_key: "location",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 5,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "radio",
    label: "Are you sharing a table?",
    field_key: "sharing_table",
    required: true,
    placeholder: "",
    options: ["Yes", "No"],
    sortOrder: 6,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Konfolio Link",
    field_key: "konfolio_link",
    required: true,
    placeholder: "https://konfolio.com/",
    options: [],
    sortOrder: 7,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Portfolio Link",
    field_key: "portfolio_link",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 8,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Social Media Link",
    field_key: "social_media_link",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 9,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Online Shop",
    field_key: "online_shop",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 10,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Additional Link",
    field_key: "additional_link",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 11,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "dropdown",
    label: "Your Merchandise",
    field_key: "merchandise",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 12,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "dropdown",
    label: "Do you have a valid sales permit in California (CA)?",
    field_key: "sales_permit",
    required: true,
    placeholder: "",
    options: ["Yes", "No"],
    sortOrder: 13,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "checkbox",
    label: "Have you vended for us previously?",
    field_key: "previous_vending",
    required: true,
    placeholder: "",
    options: [
      "2025",
      "2024",
      "2023",
      "Yes, but not listed above.",
      "No, I have not.",
    ],
    sortOrder: 14,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Vend Experience 1",
    field_key: "vend_experience_1",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 15,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Vend Experience 2",
    field_key: "vend_experience_2",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 16,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Vend Experience 3",
    field_key: "vend_experience_3",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 17,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Vend Experience 4",
    field_key: "vend_experience_4",
    required: false,
    placeholder: "",
    options: [],
    sortOrder: 18,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "dropdown",
    label: "First-Choice Option",
    field_key: "first_choice",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 19,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "dropdown",
    label: "Second-Choice Option",
    field_key: "second_choice",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 20,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "date",
    label: "What is the latest date we can inform you of an opening?",
    field_key: "latest_opening_date",
    required: true,
    placeholder: "",
    options: [],
    sortOrder: 21,
    page: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "radio",
    label: "I agree to the Terms of Service of Event Name.",
    field_key: "terms_agreement",
    required: true,
    placeholder: "",
    options: ["Yes, I agree."],
    sortOrder: 22,
    page: 1,
  },
];

type Field = {
  id: string;
  type: string;
  label: string;
  field_key: string;
  required: boolean;
  placeholder: string;
  options: string[];
  sortOrder: number;
  page: number;
};

function EditableField({
  field,
  isProtected,
  onLabelChange,
  onDelete,
  onOptionAdd,
  onOptionChange,
  onOptionDelete,
}: {
  field: Field;
  isProtected: boolean;
  onLabelChange: (val: string) => void;
  onDelete: () => void;
  onOptionAdd: () => void;
  onOptionChange: (i: number, val: string) => void;
  onOptionDelete: (i: number) => void;
}) {
  const [editingLabel, setEditingLabel] = useState(false);

  const hasOptions = ["dropdown", "radio", "checkbox", "select"].includes(
    field.type,
  );

  return (
    <div className="flex flex-col gap-[8px] group">
      {/* Label row */}
      <div className="flex items-center gap-[8px]">
        {editingLabel ? (
          <input
            autoFocus
            value={field.label}
            onChange={(e) => onLabelChange(e.target.value)}
            onBlur={() => setEditingLabel(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingLabel(false)}
            className="flex-1 text-[14px] text-[#262626] border-b border-[#C0BDB4] outline-none bg-transparent pb-[1px]"
          />
        ) : (
          <button
            onClick={() => setEditingLabel(true)}
            className="flex items-center gap-[6px] text-[14px] text-[#262626] hover:opacity-70 text-left"
          >
            {field.label}
            {field.required && <span className="text-[#C0BDB4]">*</span>}
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              className="opacity-0 group-hover:opacity-100 shrink-0"
            >
              <path
                d="M11 2a1.5 1.5 0 0 1 2.1 2.1L5 12.2l-3 .8.8-3L11 2Z"
                stroke="#A5A5A5"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {!isProtected && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 ml-auto text-[#C0BDB4] hover:text-[#A32D2D] shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Input preview */}
      {field.type === "short_text" || field.type === "text" ? (
        <input
          type="text"
          disabled
          placeholder={field.placeholder || field.label}
          className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
        />
      ) : field.type === "date" ? (
        <input
          type="date"
          disabled
          className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
        />
      ) : field.type === "radio" ? (
        <div className="flex flex-col gap-[8px]">
          {(field.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-[8px] group/opt">
              <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#C0BDB4] shrink-0" />
              <input
                value={opt}
                onChange={(e) => onOptionChange(i, e.target.value)}
                className="flex-1 text-[14px] text-[#262626] border-b border-transparent focus:border-[#C0BDB4] outline-none bg-transparent"
              />
              <button
                onClick={() => onOptionDelete(i)}
                className="opacity-0 group-hover/opt:opacity-100 text-[#C0BDB4] hover:text-[#A32D2D]"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={onOptionAdd}
            className="self-start text-[12px] text-[#A5A5A5] hover:text-[#262626]"
          >
            + Add option
          </button>
        </div>
      ) : field.type === "checkbox" ? (
        <div className="flex flex-col gap-[8px]">
          {(field.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-[8px] group/opt">
              <div className="w-[16px] h-[16px] rounded-[3px] border border-[#C0BDB4] shrink-0" />
              <input
                value={opt}
                onChange={(e) => onOptionChange(i, e.target.value)}
                className="flex-1 text-[14px] text-[#262626] border-b border-transparent focus:border-[#C0BDB4] outline-none bg-transparent"
              />
              <button
                onClick={() => onOptionDelete(i)}
                className="opacity-0 group-hover/opt:opacity-100 text-[#C0BDB4] hover:text-[#A32D2D]"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={onOptionAdd}
            className="self-start text-[12px] text-[#A5A5A5] hover:text-[#262626]"
          >
            + Add option
          </button>
        </div>
      ) : field.type === "dropdown" || field.type === "select" ? (
        <div className="flex flex-col gap-[8px]">
          <div className="relative">
            <select
              disabled
              className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] appearance-none outline-none cursor-default"
            >
              <option>Select</option>
              {(field.options ?? []).map((opt, i) => (
                <option key={i}>{opt}</option>
              ))}
            </select>
            <svg
              className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none"
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
          </div>
          {/* Editable options list */}
          <div className="flex flex-col gap-[6px] pl-[4px]">
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-[8px] group/opt">
                <span className="text-[12px] text-[#A5A5A5]">—</span>
                <input
                  value={opt}
                  onChange={(e) => onOptionChange(i, e.target.value)}
                  className="flex-1 text-[13px] text-[#262626] border-b border-transparent focus:border-[#C0BDB4] outline-none bg-transparent"
                />
                <button
                  onClick={() => onOptionDelete(i)}
                  className="opacity-0 group-hover/opt:opacity-100 text-[#C0BDB4] hover:text-[#A32D2D]"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 3l10 10M13 3L3 13"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={onOptionAdd}
              className="self-start text-[12px] text-[#A5A5A5] hover:text-[#262626]"
            >
              + Add option
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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

function TagPicker({
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

export default function EditOrganizerFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [pages, setPages] = useState([1]);
  const [appCount, setAppCount] = useState(0);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [setLimitOpen, setSetLimitOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [saving, setSaving] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!formId) return;
    const fetchForm = async () => {
      const [formRes, appsRes] = await Promise.all([
        fetch(`/api/forms/${formId}`),
        fetch(`/api/forms/${formId}/applications`),
      ]);

      const formJson = await formRes.json();
      const appsJson = await appsRes.json();

      setFormData(formJson.form);
      setTags(formJson.form.tags ?? []);
      setDescription(formJson.form.description ?? "");
      setCoverImageUrl(formJson.form.cover_image_url ?? null);

      if (!formRes.ok) return;
      setFormData(formJson.form);

      if (appsRes.ok) {
        setAppCount(
          Array.isArray(appsJson.applications)
            ? appsJson.applications.length
            : 0,
        );
      }

      if (!formJson.form.fields || formJson.form.fields.length === 0) {
        setFields(DEFAULT_FIELDS);
        await fetch(`/api/forms/${formId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: DEFAULT_FIELDS }),
        });
      } else {
        setFields(formJson.form.fields);
      }
    };
    fetchForm();
  }, [formId]);

  const saveFormMeta = async (updates: Record<string, any>) => {
    await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const saveFields = async (updatedFields: Field[]) => {
    setSaving(true);
    await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: updatedFields }),
    });
    setSaving(false);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      saveFields(updated);
      return updated;
    });
  };

  const deleteField = (id: string) => {
    setFields((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFields(updated);
      return updated;
    });
  };

  const addOption = (id: string) => {
    setFields((prev) => {
      const updated = prev.map((f) =>
        f.id === id
          ? { ...f, options: [...(f.options ?? []), "New option"] }
          : f,
      );
      saveFields(updated);
      return updated;
    });
  };

  const updateOption = (fieldId: string, optIndex: number, val: string) => {
    setFields((prev) => {
      const updated = prev.map((f) => {
        if (f.id !== fieldId) return f;
        const newOptions = [...(f.options ?? [])];
        newOptions[optIndex] = val;
        return { ...f, options: newOptions };
      });
      saveFields(updated);
      return updated;
    });
  };

  const deleteOption = (fieldId: string, optIndex: number) => {
    setFields((prev) => {
      const updated = prev.map((f) => {
        if (f.id !== fieldId) return f;
        return {
          ...f,
          options: (f.options ?? []).filter((_, i) => i !== optIndex),
        };
      });
      saveFields(updated);
      return updated;
    });
  };

  const addField = (type: string = "short_text") => {
    const newField: Field = {
      id: crypto.randomUUID(),
      type,
      label: "New Question",
      field_key: `custom_${Date.now()}`,
      required: false,
      placeholder: "",
      options: ["radio", "checkbox", "dropdown", "select"].includes(type)
        ? ["Option 1"]
        : [],
      sortOrder: fields.length,
      page: activePage,
    };
    setFields((prev) => {
      const updated = [...prev, newField];
      saveFields(updated);
      return updated;
    });
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/forms/${formId}/publish`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        setPublicUrl(json.publicUrl);
        setPublishOpen(true);
      } else {
        console.error("Publish failed:", json.error);
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);

    try {
      const { supabase } = await import("@/lib/supabase/browser");
      const ext = file.name.split(".").pop();
      const path = `form-covers/${formId}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("konfolio-images")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage
        .from("konfolio-images")
        .getPublicUrl(path);
      const url = data.publicUrl;

      setCoverImageUrl(url);
      await saveFormMeta({ cover_image_url: url });
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const PageNavigator = () => (
    <div className="w-full flex items-center justify-center gap-[10px] py-[20px]">
      <button className="text-[#C0BDB4] hover:text-[#262626]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="text-[14px] text-[#A5A5A5]">Pages</span>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setActivePage(page)}
          className={`text-[14px] pb-[1px] ${activePage === page ? "text-[#262626] border-b border-[#262626]" : "text-[#A5A5A5] border-b border-transparent"}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => {
          const next = pages.length + 1;
          setPages([...pages, next]);
          setActivePage(next);
        }}
        className="w-[22px] h-[22px] rounded-full border border-[#E9E9E9] bg-white flex items-center justify-center text-[#A5A5A5] text-[16px] hover:opacity-70 leading-none"
      >
        +
      </button>
      <button className="text-[#C0BDB4] hover:text-[#262626]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );

  return (
    <main
      className={`min-h-screen bg-[#F7F7F7] ${setLimitOpen || publishOpen ? "overflow-hidden h-screen" : ""}`}
    >
      <Navbar />

      {/* Top Header Bar */}
      <div className="w-full bg-white border-b border-[#E9E9E9] px-[40px] py-[16px] flex items-center justify-between">
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center gap-[8px] text-[16px] text-[#262626]">
            <Link href="/my-forms" className="hover:opacity-70">
              ← {formData?.title ?? "Untitled Form"}
            </Link>
            <span className="text-[#C0BDB4]">/</span>
            <span>Edit Form</span>
          </div>
          <div className="flex items-center gap-[12px] text-[13px] text-[#A5A5A5]">
            <span className="flex items-center gap-[5px]">
              <span
                className={`w-[7px] h-[7px] rounded-full inline-block ${formData?.status === "receiving" ? "bg-[#639922]" : "bg-[#A5A5A5]"}`}
              />
              <span className="text-[#262626] capitalize">
                {formData?.status ?? "draft"}
              </span>
            </span>
            <span>
              {appCount} application{appCount === 1 ? "" : "s"}
            </span>
            {saving && <span className="text-[#C0BDB4]">Saving...</span>}
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={() => setSetLimitOpen(true)}
            className="h-[40px] px-[24px] rounded-full bg-[#E9E9E9] text-[14px] text-[#262626] hover:opacity-80"
          >
            Set Limit
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="h-[40px] px-[24px] rounded-full bg-[#262626] text-[14px] text-white hover:opacity-80 disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
          <button className="w-[40px] h-[40px] rounded-full border border-[#E9E9E9] flex items-center justify-center hover:opacity-70">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8A1.5 1.5 0 0 0 13 12.5V10M10 2h4m0 0v4m0-4L6.5 9.5"
                stroke="#262626"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <PageNavigator />

      {/* Main Content */}
      <div className="w-full flex justify-center px-[40px]">
        <div className="w-full max-w-[1040px] flex flex-col gap-[24px]">
          {/* Cover Image Area */}
          <div className="w-full h-[200px] bg-white rounded-[12px] border-[0.5px] border-[#E9E9E9] relative overflow-hidden">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
                width={300}
                height={200}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[13px] text-[#C0BDB4]">
                No cover image
              </div>
            )}
            {/* Upload button */}
            <label className="absolute bottom-[12px] right-[12px] text-[#C0BDB4] hover:text-[#262626] cursor-pointer">
              {uploadingImage ? (
                <span className="text-[12px]">Uploading...</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="1.5"
                    y="3.5"
                    width="15"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle
                    cx="6"
                    cy="7.5"
                    r="1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M1.5 12l4-3 3 2.5 2.5-2 5 4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            {/* Remove button */}
            {coverImageUrl && (
              <button
                onClick={() => {
                  setCoverImageUrl(null);
                  saveFormMeta({ cover_image_url: null });
                }}
                className="absolute top-[12px] right-[12px] text-[#C0BDB4] hover:text-[#A32D2D]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {activePage === 1 && (
            <>
              <div className="flex flex-col gap-[12px]">
                <h1 className="text-[32px] font-medium text-[#262626]">
                  {formData?.title ?? "Untitled Form"}
                </h1>
                <div className="flex items-center gap-[8px] text-[14px] text-[#262626]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="11"
                      rx="1.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M5 2v2M11 2v2M2 7h12"
                      stroke="#A5A5A5"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{formData?.event_date_start ?? "Event Date"}</span>
                </div>
                <div className="flex items-center gap-[8px] text-[14px] text-[#262626]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1.5a5 5 0 0 1 5 5c0 3.5-5 8.5-5 8.5S3 10 3 6.5a5 5 0 0 1 5-5Z"
                      stroke="#A5A5A5"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="8"
                      cy="6.5"
                      r="1.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.2"
                    />
                  </svg>
                  <span>{formData?.event_address ?? "Event Address"}</span>
                </div>

                {/* Tags */}
                <TagPicker
                  selected={tags}
                  onChange={(next) => {
                    setTags(next);
                    saveFormMeta({ tags: next });
                  }}
                />

                {/* Selected tags display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-[6px]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-[4px] h-[26px] px-[10px] rounded-full bg-[#F1EFE8] text-[12px] text-[#5F5E5A]"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const next = tags.filter((t) => t !== tag);
                            setTags(next);
                            saveFormMeta({ tags: next });
                          }}
                          className="hover:opacity-70 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Editable description */}
                {editingDescription ? (
                  <textarea
                    autoFocus
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => {
                      setEditingDescription(false);
                      saveFormMeta({ description });
                    }}
                    rows={3}
                    placeholder="Tell applicants about your event."
                    className="text-[14px] text-[#262626] border border-[#E9E9E9] rounded-[10px] px-[14px] py-[10px] bg-white outline-none focus:border-[#C0BDB4] resize-none"
                  />
                ) : (
                  <button
                    onClick={() => setEditingDescription(true)}
                    className="text-left text-[14px] text-[#C0BDB4] hover:text-[#A5A5A5]"
                  >
                    {description || "Tell applicants about your event."}
                  </button>
                )}
              </div>

              {/* Editable Fields */}
              <div className="flex flex-col gap-[28px] pb-[40px]">
                {fields
                  .filter((f) => (f.page ?? 1) === 1)
                  .map((field) => (
                    <EditableField
                      key={field.id}
                      field={field}
                      isProtected={PROTECTED_FIELD_KEYS.includes(
                        field.field_key,
                      )}
                      onLabelChange={(val) =>
                        updateField(field.id, { label: val })
                      }
                      onDelete={() => deleteField(field.id)}
                      onOptionAdd={() => addOption(field.id)}
                      onOptionChange={(i, val) =>
                        updateOption(field.id, i, val)
                      }
                      onOptionDelete={(i) => deleteOption(field.id, i)}
                    />
                  ))}

                <AddFieldButton onAdd={addField} />
              </div>
            </>
          )}

          {activePage > 1 && (
            <div className="flex flex-col gap-[24px] pb-[80px]">
              <p className="text-[14px] text-[#C0BDB4]">
                Page {activePage} — Add your questions below.
              </p>
              {fields
                .filter((f) => f.page === activePage)
                .map((field) => (
                  <EditableField
                    key={field.id}
                    field={field}
                    isProtected={false}
                    onLabelChange={(val) =>
                      updateField(field.id, { label: val })
                    }
                    onDelete={() => deleteField(field.id)}
                    onOptionAdd={() => addOption(field.id)}
                    onOptionChange={(i, val) => updateOption(field.id, i, val)}
                    onOptionDelete={(i) => deleteOption(field.id, i)}
                  />
                ))}
              <AddFieldButton onAdd={addField} />
            </div>
          )}

          <PageNavigator />
        </div>
      </div>

      {setLimitOpen && (
        <SetLimitModal
          formTitle={formData?.title ?? "Untitled Form"}
          formId={formId}
          applicationsCount={appCount}
          onClose={() => setSetLimitOpen(false)}
        />
      )}
      {publishOpen && publicUrl && (
        <PublishFormModal
          formTitle={formData?.title ?? "Untitled Form"}
          publicUrl={publicUrl}
          formId={formId}
          onClose={() => setPublishOpen(false)}
        />
      )}
      {addFieldOpen && (
        <AddFieldModal
          onSelect={(type) => addField(type)}
          onClose={() => setAddFieldOpen(false)}
        />
      )}
    </main>
  );
}
