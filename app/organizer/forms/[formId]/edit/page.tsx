"use client";

import Navbar from "@/components/Navbar";
import PublishFormModal from "@/components/modals/PublishFormModal";
import SetLimitModal from "@/components/modals/SetLimitModal";
import Link from "next/link";
import { useState } from "react";

const form = {
  title: "Untitled Form",
  status: "receiving",
  applicationsCount: 140,
};

function FormField({
  label,
  required = false,
  className = "",
}: {
  label: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>
      <label className="text-[14px] text-[#262626]">
        {label} {required && <span className="text-[#C0BDB4]">*</span>}
      </label>
      <input
        type="text"
        className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#262626] outline-none focus:border-[#C0BDB4]"
      />
    </div>
  );
}

export default function EditOrganizerFormPage() {
  const [pages, setPages] = useState([1]);
  const [setLimitOpen, setSetLimitOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [sharingTable, setSharingTable] = useState<string | null>(null);
  const [ifYesOpen, setIfYesOpen] = useState(false);
  const [hasPartner, setHasPartner] = useState<string | null>(null);

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
              ← {form.title}
            </Link>
            <span className="text-[#C0BDB4]">/</span>
            <span>Edit Form</span>
          </div>
          <div className="flex items-center gap-[12px] text-[13px] text-[#A5A5A5]">
            <span className="flex items-center gap-[5px]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#639922] inline-block" />
              <span className="text-[#262626]">Receiving</span>
            </span>
            <span>{form.applicationsCount} applications</span>
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
            onClick={() => setPublishOpen(true)}
            className="h-[40px] px-[24px] rounded-full bg-[#262626] text-[14px] text-white hover:opacity-80"
          >
            Publish
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

      {/* Page Navigator */}
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
            className={`text-[14px] pb-[1px] ${
              activePage === page
                ? "text-[#262626] border-b border-[#262626]"
                : "text-[#A5A5A5] border-b border-transparent"
            }`}
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

      {/* Main Content */}
      <div className="w-full flex justify-center px-[40px]">
        <div className="w-full max-w-[1040px] flex flex-col gap-[24px]">
          {/* Cover Image Area */}
          <div className="w-full h-[200px] bg-white rounded-[12px] border-[0.5px] border-[#E9E9E9] relative">
            <button className="absolute top-[12px] right-[12px] text-[#C0BDB4] hover:text-[#262626]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </button>
            <button className="absolute bottom-[12px] right-[12px] text-[#C0BDB4] hover:text-[#262626]">
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
            </button>
          </div>

          {/* Form Title + Meta */}
          <div className="flex flex-col gap-[12px]">
            <h1 className="text-[32px] font-medium text-[#262626]">
              Untitled Form
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
              <span>September 13 - 14 2025</span>
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
              <span>Event Address</span>
            </div>
            <button className="self-start mt-[4px] h-[32px] px-[16px] rounded-full border border-[#E9E9E9] text-[13px] text-[#A5A5A5] hover:opacity-70">
              + Tag
            </button>
            <p className="text-[14px] text-[#C0BDB4]">
              Tell applicants about your event.
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-[32px] pb-[80px]">
            {/* Row 1: First + Last Name */}
            <div className="grid grid-cols-2 gap-[24px]">
              <FormField label="First Name" required />
              <FormField label="Last Name" required />
            </div>

            {/* Preferred Name */}
            <div className="grid grid-cols-2 gap-[24px]">
              <FormField label="Preferred Name" />
            </div>

            {/* Row 2: Business Name + Email */}
            <div className="grid grid-cols-2 gap-[24px]">
              <FormField label="Business Name" required />
              <FormField label="Email" required />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-[24px]">
              <FormField label="Location" />
            </div>

            {/* Are you sharing a table? */}
            <div className="flex flex-col gap-[12px]">
              <label className="text-[14px] text-[#262626]">
                Are you sharing a table?{" "}
                <span className="text-[#C0BDB4]">*</span>
              </label>
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-[10px] cursor-pointer"
                >
                  <div
                    onClick={() => setSharingTable(option)}
                    className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${
                      sharingTable === option
                        ? "border-[#262626]"
                        : "border-[#C0BDB4]"
                    }`}
                  >
                    {sharingTable === option && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#262626]" />
                    )}
                  </div>
                  <span className="text-[14px] text-[#262626]">{option}</span>
                </label>
              ))}

              <div className="mt-[8px] w-full bg-white rounded-[12px] border-[0.5px] border-[#E9E9E9] overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => setIfYesOpen(!ifYesOpen)}
                  className="w-full px-[20px] py-[16px] flex items-center gap-[10px] hover:opacity-70"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${ifYesOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[14px] text-[#A5A5A5]">
                    If &quot;yes&quot;
                  </span>
                </button>

                {/* Expanded Content */}
                {ifYesOpen && (
                  <div className="px-[20px] pb-[28px] flex flex-col gap-[24px] border-t border-[#F3F3F3]">
                    {/* Do you have a partner? */}
                    <div className="flex flex-col gap-[12px] pt-[24px]">
                      <label className="text-[14px] text-[#262626]">
                        Do you have a partner?{" "}
                        <span className="text-[#C0BDB4]">*</span>
                      </label>
                      {["Yes, I have a partner.", "No, I need a partner."].map(
                        (option) => (
                          <label
                            key={option}
                            className="flex items-center gap-[10px] cursor-pointer"
                          >
                            <div
                              onClick={() => setHasPartner(option)}
                              className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${
                                hasPartner === option
                                  ? "border-[#262626]"
                                  : "border-[#C0BDB4]"
                              }`}
                            >
                              {hasPartner === option && (
                                <div className="w-[10px] h-[10px] rounded-full bg-[#262626]" />
                              )}
                            </div>
                            <span className="text-[14px] text-[#262626]">
                              {option}
                            </span>
                          </label>
                        ),
                      )}
                    </div>

                    {/* Table partner information */}
                    <p className="text-[14px] text-[#C0BDB4]">
                      Table partner information:
                    </p>

                    {/* First + Last Name */}
                    <div className="grid grid-cols-2 gap-[24px]">
                      <FormField label="First Name" />
                      <FormField label="Last Name" />
                    </div>

                    {/* Preferred Name */}
                    <div className="grid grid-cols-2 gap-[24px]">
                      <FormField label="Preferred Name" />
                    </div>

                    {/* Business Name + Email */}
                    <div className="grid grid-cols-2 gap-[24px]">
                      <FormField label="Business Name" />
                      <FormField label="Email" />
                    </div>

                    <p className="text-[13px] text-[#C0BDB4]">
                      Please fill in the application jointly and as accurately
                      as possible.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Konfolio Link + Portfolio Link */}
          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">
                Konfolio Link <span className="text-[#C0BDB4]">*</span>
              </label>
              <input
                type="text"
                placeholder="https//:konfolio.com/"
                className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#262626] placeholder:text-[#C0BDB4] outline-none focus:border-[#C0BDB4]"
              />
              <p className="text-[12px] text-[#C0BDB4]">
                Konfolio does not show preview of external portfolios.
              </p>
            </div>
            <FormField label="Portfolio Link" />
          </div>

          {/* Social Media Link + Online Shop */}
          <div className="grid grid-cols-2 gap-[24px]">
            <FormField label="Social Media Link" required />
            <FormField label="Online Shop" required />
          </div>

          {/* Additional Link */}
          <div className="grid grid-cols-2 gap-[24px]">
            <FormField label="Additional Link" />
          </div>

          {/* Your Merchandise */}
          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">
                Your Merchandise <span className="text-[#C0BDB4]">*</span>
              </label>
              <div className="relative">
                <select className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] appearance-none outline-none focus:border-[#C0BDB4]">
                  <option value="" disabled defaultValue={""}>
                    Select
                  </option>
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
          </div>

          {/* Sales Permit */}
          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">
                Do you have a valid sales permit in California (CA)?{" "}
                <span className="text-[#C0BDB4]">*</span>
              </label>
              <div className="relative">
                <select className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] appearance-none outline-none focus:border-[#C0BDB4]">
                  <option value="" disabled defaultValue={""}>
                    Select
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
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
          </div>

          {/* Have you vended previously? */}
          <div className="flex flex-col gap-[12px]">
            <label className="text-[14px] text-[#262626]">
              Have you vended for us previously?{" "}
              <span className="text-[#C0BDB4]">*</span>
            </label>
            {[
              "2025",
              "2024",
              "2023",
              "Yes, but not listed above.",
              "No, I have not.",
            ].map((option) => (
              <label
                key={option}
                className="flex items-center gap-[10px] cursor-pointer"
              >
                <div className="w-[18px] h-[18px] rounded-[4px] border border-[#C0BDB4] bg-white shrink-0" />
                <span className="text-[14px] text-[#262626]">{option}</span>
              </label>
            ))}
          </div>

          {/* Vend Experience 1-4 */}
          <div className="grid grid-cols-2 gap-[24px]">
            <FormField label="Vend Experience 1" />
            <FormField label="Vend Experience 2" />
          </div>
          <div className="grid grid-cols-2 gap-[24px]">
            <FormField label="Vend Experience 3" />
            <FormField label="Vend Experience 4" />
          </div>

          {/* First-Choice + Second-Choice Option */}
          <div className="grid grid-cols-2 gap-[24px]">
            {["First-Choice Option", "Second-Choice Option"].map((label) => (
              <div key={label} className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#262626]">
                  {label} <span className="text-[#C0BDB4]">*</span>
                </label>
                <div className="relative">
                  <select className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] appearance-none outline-none focus:border-[#C0BDB4]">
                    <option value="" disabled defaultValue={""}>
                      Select
                    </option>
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
            ))}
          </div>

          {/* Latest date for opening */}
          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">
                What is the latest date we can inform you of an opening?{" "}
                <span className="text-[#C0BDB4]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM / DD / YYYY"
                  className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] pr-[40px] text-[14px] text-[#262626] placeholder:text-[#C0BDB4] outline-none focus:border-[#C0BDB4]"
                />
                <svg
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect
                    x="2"
                    y="3"
                    width="12"
                    height="11"
                    rx="1.5"
                    stroke="#C0BDB4"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M5 2v2M11 2v2M2 7h12"
                    stroke="#C0BDB4"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="flex flex-col gap-[12px]">
            <p className="text-[14px] text-[#262626]">
              I agree to the Terms of Service{" "}
              <span className="font-medium">(add link to text)</span> of Event
              Name. <span className="text-[#C0BDB4]">*</span>
            </p>
            <label className="flex items-center gap-[10px] cursor-pointer">
              <div className="w-[20px] h-[20px] rounded-full border-[1.5px] border-[#C0BDB4] flex items-center justify-center" />
              <span className="text-[14px] text-[#262626]">Yes, I agree.</span>
            </label>
          </div>

          {/* Bottom Page Navigator */}
          <div className="w-full flex items-center justify-center gap-[10px] py-[48px]">
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
                className={`text-[14px] pb-[1px] ${
                  activePage === page
                    ? "text-[#262626] border-b border-[#262626]"
                    : "text-[#A5A5A5] border-b border-transparent"
                }`}
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
        </div>
      </div>
      {setLimitOpen && (
        <SetLimitModal
          formTitle={form.title}
          applicationsCount={form.applicationsCount}
          onClose={() => setSetLimitOpen(false)}
        />
      )}
      {publishOpen && (
        <PublishFormModal
          formTitle={form.title}
          formSlug="untitled_form"
          onClose={() => setPublishOpen(false)}
        />
      )}
    </main>
  );
}
