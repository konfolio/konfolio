"use client";

import { useState } from "react";

export type Field = {
  id: string;
  type: string;
  label: string;
  field_key: string;
  required: boolean;
  placeholder: string;
  options: string[];
  sortOrder: number;
  page: number;
  conditional?: {
    fieldKey: string;
    value: string;
  };
};

export default function EditableField({
  field,
  isProtected,
  onLabelChange,
  onDelete,
  onOptionAdd,
  onOptionChange,
  onOptionDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onToggleRequired,
  onPlaceholderChange,
}: {
  field: Field;
  isProtected: boolean;
  onLabelChange: (val: string) => void;
  onDelete: () => void;
  onOptionAdd: () => void;
  onOptionChange: (i: number, val: string) => void;
  onOptionDelete: (i: number) => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onToggleRequired?: () => void;
  onPlaceholderChange?: (val: string) => void;
}) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col gap-[8px] group rounded-[8px] transition-colors ${isDragOver ? "bg-[#F7F7F7] ring-1 ring-[#E9E9E9]" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
        onDragOver?.(e);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false);
        onDrop?.();
      }}
    >
      {/* Label row */}
      <div className="flex items-center gap-[8px]">
        <div className="opacity-0 group-hover:opacity-100 cursor-grab text-[#C0BDB4] shrink-0 -ml-[20px]">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="4" r="1.2" fill="currentColor" />
            <circle cx="5" cy="8" r="1.2" fill="currentColor" />
            <circle cx="5" cy="12" r="1.2" fill="currentColor" />
            <circle cx="11" cy="4" r="1.2" fill="currentColor" />
            <circle cx="11" cy="8" r="1.2" fill="currentColor" />
            <circle cx="11" cy="12" r="1.2" fill="currentColor" />
          </svg>
        </div>
        {field.type !== "plain_text" && editingLabel ? (
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
        <div className="opacity-0 group-hover:opacity-100 ml-auto flex items-center gap-[8px] shrink-0">
          {field.type !== "plain_text" && (
            <button
              onClick={onToggleRequired}
              className={`text-[11px] px-[8px] py-[2px] rounded-full border transition-colors ${
                field.required
                  ? "border-[#262626] text-[#262626]"
                  : "border-[#E9E9E9] text-[#A5A5A5]"
              }`}
            >
              {field.required ? "Required" : "Optional"}
            </button>
          )}

          {!isProtected && (
            <button
              onClick={onDelete}
              className="text-[#C0BDB4] hover:text-[#A32D2D]"
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
      ) : field.type === "image" ? (
        <div className="h-[80px] rounded-[10px] border border-dashed border-[#C0BDB4] bg-white flex items-center justify-center gap-[8px] text-[13px] text-[#C0BDB4] cursor-default">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
          Upload image
        </div>
      ) : field.type === "plain_text" ? (
        <textarea
          value={field.placeholder}
          onChange={(e) => onPlaceholderChange?.(e.target.value)}
          placeholder="Write instructions or context for applicants..."
          rows={3}
          className="w-full rounded-[10px] border border-dashed border-[#E9E9E9] bg-[#FAFAFA] px-[14px] py-[12px] text-[14px] text-[#262626] outline-none resize-none"
        />
      ) : null}
    </div>
  );
}
