"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import ArrowDown from "@/components/icons/ArrowDown";
import InfoPopover from "@/components/icons/InfoPopover"
import ArrowLeft from "../icons/ArrowLeft";
import InfoIcon from "../icons/InfoIcon";
import CalendarIcon from "../icons/CalendarIcon";
import ArrowRightIcon from "../icons/ArrowRight";
import DeleteIcon from "../icons/DeleteIcon";

const ICONS = "/images/invoice-wizard";

export type InvoiceFormOption = {
  id: string;
  title: string;
  tabs?: string[]; // submission tabs for this form
};

type Props = {
  open: boolean;
  onClose: () => void;
  forms?: InvoiceFormOption[];
};

type InvoiceData = {
  formId: string;
  tab: string;
  allowUnlisted: boolean;
  dueDate: string;
  noDueDate: boolean;
  name: string;
};

const emptyData: InvoiceData = {
  formId: "",
  tab: "",
  allowUnlisted: false,
  dueDate: "",
  noDueDate: false,
  name: "",
};

const DEFAULT_TABS = ["All Submissions"];

const primaryBtn = "flex h-[33px] min-w-[150px] items-center justify-center gap-[7px] rounded-full bg-[#262626] px-[40px] font-inter text-[14px] leading-[1.3] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

// Centered under the Info icon
const popoverStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 12px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 20,
};

/* ---------- Small pieces ---------- */

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-w-[120px] cursor-pointer items-center gap-[7px] py-[5px]">
      <span className="relative flex size-[13px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-[13px] cursor-pointer appearance-none rounded-[3.25px] border border-[#262626] checked:bg-[#262626]"
        />
        <svg
          viewBox="0 0 10 8"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute hidden w-[8px] peer-checked:block"
        >
          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="font-inter text-[12px] leading-[1.3] text-black/40">{label}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="flex w-[280px] max-w-full flex-col gap-[10px]">
      <span className="py-[5px] font-inter text-[17px] leading-[1.4] text-[#262626]">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={label}
          className={`h-[40px] w-full min-w-[240px] cursor-pointer appearance-none rounded-[8px] border-[0.5px] border-black/40 bg-white pl-[16px] pr-[40px] font-inter text-[15px] leading-[1.4] outline-none focus:border-[#262626] disabled:cursor-not-allowed disabled:opacity-60 ${
            value ? "text-[#262626]" : "text-[#d3d3d3]"
          }`}
        >
          <option value="" disabled>
            Select
          </option>
          {options.length === 0 ? (
            <option value="__none" disabled>
              No options yet
            </option>
          ) : (
            options.map((o) => (
              <option key={o.value} value={o.value} className="text-[#262626]">
                {o.label}
              </option>
            ))
          )}
        </select>
        <span className="pointer-events-none absolute right-[16px] top-1/2 flex size-[16px] -translate-y-1/2 items-center justify-center text-black/40">
          <ArrowDown />
        </span>
      </div>
    </div>
  );
}

/* ---------- Wizard ---------- */

export default function CreateInvoiceWizard({ open, onClose, forms = [] }: Props) {
  const router = useRouter();
  const dateRef = useRef<HTMLInputElement>(null);
  const infoText = "Payment tracking will refer to this tab using applicant’s First Name, Last Name, Business Name, and Email.";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [infoOpen, setInfoOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InvoiceData>(emptyData);
  
  // Close the popover when the step changes or the wizard closes
  useEffect(() => {
  setInfoOpen(false);
  }, [step, open]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setStep(1);
      setLoading(false);
      setData(emptyData);
    }
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectedForm = forms.find((f) => f.id === data.formId);
  const tabOptions = (selectedForm?.tabs?.length ? selectedForm.tabs : DEFAULT_TABS).map((t) => ({
    value: t,
    label: t,
  }));

  function update<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function goToStep2(skip: boolean) {
    if (skip) {
      setData((prev) => ({ ...prev, formId: "", tab: "", allowUnlisted: false }));
    } else if (!data.formId || !data.tab) {
      return;
    }
    setStep(2);
  }

  function goToStep3() {
    if (!data.noDueDate && !data.dueDate) return;
    // Prefill the name from the linked form
    if (!data.name.trim() && selectedForm) {
      update("name", `${selectedForm.title} - Invoice`);
    }
    setStep(3);
  }

  function goBack() {
    setStep((prev) => (prev === 3 ? 2 : 1));
  }

  async function handleCreate() {
    const name = data.name.trim();
    if (!name) return;

    try {
      setLoading(true);

      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          formId: data.formId || null,
          tab: data.tab || null,
          allowUnlisted: data.allowUnlisted,
          dueDate: data.noDueDate ? null : data.dueDate,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json.error || "Failed to create invoice");
        return;
      }

      onClose();
      router.push(`/organizer/invoices/${json.invoiceId}/edit`);
    } catch {
      alert("Something went wrong creating the invoice");
    } finally {
      setLoading(false);
    }
  }

  const titleText =
    step === 1 ? "Track Applicant Payment" : step === 2 ? "Payment Due Date" : "Invoice Form Name";

    const popoverStyle: React.CSSProperties = {
      position: "absolute",
      top: "calc(100% + 12px)", // 8px arrow + ~4px gap
      left: "50%",
      transform: "translateX(-50%)",
      width: 245,
      zIndex: 20,
    };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/[0.16] p-[20px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(); // background click
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-invoice-title"
        className="relative flex h-[400px] max-h-[88vh] w-[756px] max-w-full flex-col items-center justify-between overflow-hidden rounded-[15px] bg-white p-[50px] shadow-[5px_5px_25px_rgba(0,0,0,0.1)]"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[20px] top-[20px] size-[26px] cursor-pointer"
        >
          <DeleteIcon />
        </button>

        {/* Header */}
        <div className="relative flex w-full items-center justify-center gap-[7px]">
          {step !== 1 ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Back"
              className="absolute left-0 top-1/2 size-[26px] -translate-y-1/2 cursor-pointer"
            >
              <ArrowLeft />
            </button>
          ) : null}

          <h2 id="create-invoice-title" className="m-0 font-inter text-[20px] font-normal leading-[1.4] text-black">
            {titleText}
          </h2>

            {step === 1 ? (
            <div className="relative flex">
                <button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                aria-label="About payment tracking"
                aria-expanded={infoOpen}
                className="flex justify-center items-center size-[18px] cursor-pointer"
                >
                <InfoIcon />
                </button>

                <div style={popoverStyle}>
                <div id="create-invoice-info-popover">
                    <InfoPopover open={infoOpen} text={infoText} onClose={() => setInfoOpen(false)} width={245} />
                </div>
                </div>
            </div>
            ) : null}
        </div>

        {/* Step 1: Track Applicant Payment */}
        {step === 1 && (
          <div className="flex flex-col items-start gap-[10px]">
            <div className="flex flex-col gap-[20px] min-[700px]:flex-row">
              <SelectField
                label="Form"
                value={data.formId}
                onChange={(v) => setData((prev) => ({ ...prev, formId: v, tab: "" }))}
                options={forms.map((f) => ({ value: f.id, label: f.title }))}
              />
              <SelectField
                label="Tab"
                value={data.tab}
                onChange={(v) => update("tab", v)}
                options={tabOptions}
                disabled={!data.formId}
              />
            </div>
            <Checkbox
              checked={data.allowUnlisted}
              onChange={(c) => update("allowUnlisted", c)}
              label="Allow applicants NOT listed in this tab to make payment."
            />
          </div>
        )}

        {/* Step 2: Payment Due Date */}
        {step === 2 && (
          <div className="flex w-[380px] max-w-full flex-col items-start gap-[10px]">
            <div className="relative flex w-full flex-col gap-[10px] pt-[10px]">
              <input
                ref={dateRef}
                type="date"
                value={data.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
                onClick={() => dateRef.current?.showPicker?.()}
                disabled={data.noDueDate}
                aria-label="Payment due date"
                className={`w-full bg-transparent px-[24px] text-center font-inter text-[15px] leading-[1.4] outline-none disabled:opacity-40 [&::-webkit-calendar-picker-indicator]:hidden ${
                  data.dueDate ? "text-[#262626]" : "text-[#d3d3d3]"
                }`}
              />
              <button
                type="button"
                onClick={() => dateRef.current?.showPicker?.()}
                disabled={data.noDueDate}
                aria-label="Open calendar"
                className="absolute right-0 top-[11px] size-[18px] disabled:opacity-40"
              >
                <CalendarIcon color="#999999"/>
              </button>
              <div className="h-px w-full bg-black/40" />
            </div>

            <Checkbox
              checked={data.noDueDate}
              onChange={(c) =>
                setData((prev) => ({ ...prev, noDueDate: c, dueDate: c ? "" : prev.dueDate }))
              }
              label="No due date"
            />
          </div>
        )}

        {/* Step 3: Invoice Form Name */}
        {step === 3 && (
          <div className="flex w-[380px] max-w-full flex-col items-center gap-[10px] pt-[10px]">
            <input
              autoFocus
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Form Name - Invoice"
              aria-label="Invoice form name"
              className="w-full bg-transparent text-center font-inter text-[17px] leading-[1.4] text-[#262626] outline-none placeholder:text-[#d3d3d3]"
            />
            <div className="h-px w-full bg-black/40" />
          </div>
        )}

        {/* Footer */}
        {step === 1 && (
          <div className="flex items-start gap-[30px]">
            <SecondaryButton
              onClick={() => goToStep2(true)}
              className="h-[33px] min-w-[150px] px-[40px]"
            >
              Skip
            </SecondaryButton>
            <button
              type="button"
              onClick={() => goToStep2(false)}
              disabled={!data.formId || !data.tab}
              className={primaryBtn}
            >
              Next
              <ArrowRightIcon className="size-4"/>
            </button>
          </div>
        )}

        {step === 2 && (
          <button
            type="button"
            onClick={goToStep3}
            disabled={!data.noDueDate && !data.dueDate}
            className={primaryBtn}
          >
            Next
            <ArrowRightIcon className="size-4"/>
          </button>
        )}

        {step === 3 && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !data.name.trim()}
            className={primaryBtn}
          >
            {loading ? "Creating..." : "Next"}
            {!loading ? <ArrowRightIcon className="size-4"/> : null}
          </button>
        )}
      </div>
    </div>
  );
}