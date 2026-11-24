import Image from "next/image";
import { useEffect, useState } from "react";
import MerchTagsField from "@/components/fields/MerchTagsField";

export type Field = {
  id: string;
  type: string;
  label: string;
  field_key?: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

function isMerchandiseField(field: Field) {
  if (field.field_key === "merchandise") return true;
  return field.label.trim().toLowerCase() === "your merchandise";
}

export default function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (val: any) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(value instanceof File)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const label = (
    <label className="text-[14px] text-[#262626]">
      {field.label}{" "}
      {field.required && <span className="text-[#C0BDB4]">*</span>}
    </label>
  );

  if (field.type === "plain_text") {
    return (
      <div className="flex flex-col gap-[4px]">
        <p className="text-[14px] text-[#262626]">{field.label}</p>
        {field.placeholder && (
          <p className="text-[13px] text-[#A5A5A5]">{field.placeholder}</p>
        )}
      </div>
    );
  }

  if (field.type === "short_text" || field.type === "text") {
    return (
      <div className="flex flex-col gap-[8px]">
        {label}
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#262626] outline-none focus:border-[#C0BDB4]"
        />
      </div>
    );
  }

  if (field.type === "long_text" || field.type === "textarea") {
    return (
      <div className="flex flex-col gap-[8px]">
        {label}
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          rows={4}
          className="rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] py-[12px] text-[14px] text-[#262626] outline-none focus:border-[#C0BDB4] resize-none"
        />
      </div>
    );
  }

  if (field.type === "radio" || field.type === "single_choice" || field.type === "multiple_choice") {
    return (
      <div className="flex flex-col gap-[12px]">
        {label}
        {(field.options ?? []).map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-[10px] cursor-pointer"
          >
            <div
              onClick={() => onChange(opt)}
              className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${
                value === opt ? "border-[#262626]" : "border-[#C0BDB4]"
              }`}
            >
              {value === opt && (
                <div className="w-[10px] h-[10px] rounded-full bg-[#262626]" />
              )}
            </div>
            <span className="text-[14px] text-[#262626]">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox" || field.type === "multi_choice") {
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-[12px]">
        {label}
        {(field.options ?? []).map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label
              key={opt}
              className="flex items-center gap-[10px] cursor-pointer"
            >
              <div
                onClick={() =>
                  onChange(
                    checked
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt],
                  )
                }
                className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center cursor-pointer ${
                  checked
                    ? "bg-[#262626] border-[#262626]"
                    : "bg-white border-[#C0BDB4]"
                }`}
              >
                {checked && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-[#262626]">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if ((field.type === "dropdown" || field.type === "select") && isMerchandiseField(field)) {
    return (
      <MerchTagsField
        label={label}
        options={field.options}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (field.type === "dropdown" || field.type === "select") {
    return (
      <div className="flex flex-col gap-[8px]">
        {label}
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#262626] appearance-none outline-none focus:border-[#C0BDB4]"
          >
            <option value="" disabled>
              Select
            </option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
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
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="flex flex-col gap-[8px]">
        {label}
        <input
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#262626] outline-none focus:border-[#C0BDB4]"
        />
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div className="flex flex-col gap-[8px]">
        {label}
        <label className="h-[80px] rounded-[10px] border border-dashed border-[#C0BDB4] bg-white flex items-center justify-center gap-[8px] text-[13px] text-[#A5A5A5] cursor-pointer hover:border-[#262626] hover:text-[#262626] transition-colors">
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
          {value ? (value as File).name : "Click to upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
          />
        </label>
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Preview"
            className="h-[120px] w-full object-cover rounded-[10px]"
            width={720}
            height={120}
          />
        )}
      </div>
    );
  }

  return null;
}
