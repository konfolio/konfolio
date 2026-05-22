"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

type Form = {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  event_date_start: string | null;
  event_date_end: string | null;
  event_address: string | null;
  cover_image_url: string | null;
  application_limit: number | null;
  fields: Field[];
};

type Field = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

function StatusBanner({
  formTitle,
  organizerName,
  organizerLinks,
  closed,
}: {
  formTitle: string;
  organizerName: string;
  organizerLinks: Record<string, string>;
  closed: boolean;
}) {
  return (
    <div className="w-full bg-white rounded-[16px] border-[0.5px] border-[#E9E9E9] px-[24px] py-[20px] flex flex-col gap-[10px]">
      <p className="text-[14px] text-[#262626]">
        {closed ? (
          <>
            <span className="font-semibold">{formTitle}</span> is no longer
            accepting applications.
          </>
        ) : (
          <>
            Your application has been successfully submitted to{" "}
            <span className="font-semibold">{formTitle}</span>!
          </>
        )}
      </p>
      <p className="text-[13px] text-[#A5A5A5]">
        Stay updated with {organizerName || "Organization Name"} here:
      </p>
      <div className="flex items-center gap-[14px]">
        {organizerLinks.website && (
          <Link
            href={organizerLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="1.5"
                y="1.5"
                width="15"
                height="15"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M1.5 9h15M9 1.5C9 1.5 6.5 4.5 6.5 9s2.5 7.5 2.5 7.5M9 1.5C9 1.5 11.5 4.5 11.5 9S9 16.5 9 16.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}
        {organizerLinks.instagram && (
          <Link
            href={organizerLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="1.5"
                y="1.5"
                width="15"
                height="15"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle
                cx="9"
                cy="9"
                r="3"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="13" cy="5" r="0.75" fill="currentColor" />
            </svg>
          </Link>
        )}
        {organizerLinks.x && (
          <Link
            href={organizerLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2l14 14M16 2L2 16"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}
        {organizerLinks.facebook && (
          <Link
            href={organizerLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M12 2h-2a3 3 0 0 0-3 3v2H5v3h2v6h3v-6h2l1-3h-3V5a1 1 0 0 1 1-1h2V2Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (val: any) => void;
}) {
  const label = (
    <label className="text-[14px] text-[#262626]">
      {field.label}{" "}
      {field.required && <span className="text-[#C0BDB4]">*</span>}
    </label>
  );

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

  if (field.type === "radio" || field.type === "single_choice") {
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
        {value && (
          <Image
            src={URL.createObjectURL(value as File)}
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

export default function ApplyFormPage() {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<Form | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [organizerName, setOrganizerName] = useState("");
  const [organizerLinks, setOrganizerLinks] = useState<Record<string, string>>(
    {},
  );

  const totalPages = form
    ? Math.max(...(form.fields ?? []).map((f: any) => f.page ?? 1), 1)
    : 1;

  const currentFields = (form?.fields ?? []).filter(
    (f: any) => (f.page ?? 1) === currentPage,
  );

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/public/forms/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const json = await res.json();
        setForm(json.form);

        const submitCheck = await fetch(
          `/api/forms/apply/check?formId=${json.form.id}`,
        );
        if (submitCheck.ok) {
          const { submitted } = await submitCheck.json();
          if (submitted) setAlreadySubmitted(true);
        }

        const profileRes = await fetch(
          `/api/organizer/profile?organizerId=${json.form.organizer_id}`,
        );
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setOrganizerLinks(profileJson.links ?? {});
          setOrganizerName(profileJson.organizationName ?? "");
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const uploadedResponses = { ...responses };

      for (const [fieldId, val] of Object.entries(responses)) {
        if (val instanceof File) {
          const ext = val.name.split(".").pop();
          const path = `form-images/${form.id}/${fieldId}-${Date.now()}.${ext}`;
          const { error } = await supabase.storage
            .from("konfolio-images")
            .upload(path, val, { upsert: true });
          if (!error) {
            const { data } = supabase.storage
              .from("konfolio-images")
              .getPublicUrl(path);
            uploadedResponses[fieldId] = data.publicUrl;
          }
        }
      }

      const res = await fetch("/api/forms/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form.id, responses: uploadedResponses }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const json = await res.json();
        if (res.status === 409 || json.error === "already_submitted") {
          setAlreadySubmitted(true);
        } else if (res.status === 403) {
          alert(json.error);
        } else {
          alert("Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-[14px] text-[#A5A5A5]">Loading...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-[14px] text-[#A5A5A5]">Form not found.</p>
      </main>
    );
  }

  if (!form) return null;

  if (alreadySubmitted) {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <Navbar />
        <div className="w-full flex justify-center px-[16px] sm:px-[40px] py-[40px]">
          <div className="w-full max-w-[720px] flex flex-col gap-[24px]">
            <FormHeader form={form} />
            <div className="bg-white rounded-[20px] border-[0.5px] border-[#E9E9E9] px-[32px] py-[40px] flex flex-col items-center gap-[12px]">
              <p className="text-[12px] text-[#A5A5A5] self-start">
                Already Submitted
              </p>
              <h2 className="text-[18px] font-medium text-[#262626] text-center mt-[8px]">
                You already submitted to this form.
              </h2>
              <p className="text-[13px] text-[#A5A5A5] text-center">
                If this is incorrect, check with event organizer or contact
                Konfolio team.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (form.status === "closed") {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <Navbar />
        <div className="w-full flex justify-center px-[16px] sm:px-[40px] py-[40px]">
          <div className="w-full max-w-[720px]">
            <FormHeader form={form} />
            <StatusBanner
              formTitle={form.title}
              organizerName={organizerName}
              organizerLinks={organizerLinks}
              closed={true}
            />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <Navbar />
        <div className="w-full flex justify-center px-[16px] sm:px-[40px] py-[40px]">
          <div className="w-full max-w-[720px] flex flex-col gap-[24px]">
            <FormHeader form={form} />
            <div className="w-full bg-white rounded-[16px] border-[0.5px] border-[#E9E9E9] px-[32px] py-[32px] flex flex-col gap-[8px]">
              <p className="text-[16px] font-medium text-[#262626]">
                Application Submitted!
              </p>
              <p className="text-[14px] text-[#A5A5A5]">
                Your application has been successfully submitted to{" "}
                <span className="text-[#262626] font-medium">{form.title}</span>
                . The organizer will review it and get back to you.
              </p>
              {(organizerName || Object.keys(organizerLinks).length > 0) && (
                <>
                  <p className="text-[13px] text-[#A5A5A5] mt-[8px]">
                    Stay updated with {organizerName || "the organizer"} here:
                  </p>
                  <div className="flex items-center gap-[14px] mt-[4px]">
                    {organizerLinks.website && (
                      <Link
                        href={organizerLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#262626] hover:opacity-70"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <rect
                            x="1.5"
                            y="1.5"
                            width="15"
                            height="15"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                          <path
                            d="M1.5 9h15M9 1.5C9 1.5 6.5 4.5 6.5 9s2.5 7.5 2.5 7.5M9 1.5C9 1.5 11.5 4.5 11.5 9S9 16.5 9 16.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </Link>
                    )}
                    {organizerLinks.instagram && (
                      <Link
                        href={organizerLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#262626] hover:opacity-70"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <rect
                            x="1.5"
                            y="1.5"
                            width="15"
                            height="15"
                            rx="4"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                          <circle
                            cx="9"
                            cy="9"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                          <circle cx="13" cy="5" r="0.75" fill="currentColor" />
                        </svg>
                      </Link>
                    )}
                    {organizerLinks.x && (
                      <Link
                        href={organizerLinks.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#262626] hover:opacity-70"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M2 2l14 14M16 2L2 16"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </Link>
                    )}
                    {organizerLinks.facebook && (
                      <Link
                        href={organizerLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#262626] hover:opacity-70"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M12 2h-2a3 3 0 0 0-3 3v2H5v3h2v6h3v-6h2l1-3h-3V5a1 1 0 0 1 1-1h2V2Z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Active form
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <div className="w-full flex justify-center px-[16px] sm:px-[40px] py-[40px]">
        <div className="w-full max-w-[720px] flex flex-col gap-[32px]">
          <FormHeader form={form} />

          {/* Page indicator */}
          {totalPages > 1 && (
            <div className="flex items-center gap-[8px]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <div
                  key={p}
                  className={`w-[8px] h-[8px] rounded-full ${
                    p === currentPage ? "bg-[#262626]" : "bg-[#E9E9E9]"
                  }`}
                />
              ))}
              <span className="text-[12px] text-[#A5A5A5] ml-[4px]">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}

          {/* Fields for current page */}
          {currentFields.length > 0 ? (
            <div className="flex flex-col gap-[24px]">
              {currentFields.map((field: any) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={responses[field.id]}
                  onChange={(val) =>
                    setResponses((prev) => ({ ...prev, [field.id]: val }))
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#A5A5A5]">
              No fields on this page.
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-[12px]">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-[44px] px-[24px] rounded-full border border-[#E9E9E9] text-[14px] text-[#262626] hover:opacity-70"
              >
                ← Back
              </button>
            )}
            {currentPage < totalPages ? (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-[44px] px-[32px] rounded-full bg-[#262626] text-[14px] text-white hover:opacity-80"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-[44px] px-[32px] rounded-full bg-[#262626] text-[14px] text-white hover:opacity-80 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function FormHeader({ form }: { form: Form }) {
  return (
    <div className="flex flex-col gap-[12px]">
      {form.cover_image_url && (
        <div className="w-full h-[200px] rounded-[12px] overflow-hidden mb-[8px]">
          <Image
            src={form.cover_image_url}
            alt="Cover"
            width={720}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h1 className="text-[28px] font-medium text-[#262626]">{form.title}</h1>
      {form.event_date_start && (
        <div className="flex items-center gap-[8px] text-[14px] text-[#A5A5A5]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect
              x="2"
              y="3"
              width="12"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M5 2v2M11 2v2M2 7h12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>
            {form.event_date_start}
            {form.event_date_end ? ` - ${form.event_date_end}` : ""}
          </span>
        </div>
      )}
      {form.event_address && (
        <div className="flex items-center gap-[8px] text-[14px] text-[#A5A5A5]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5a5 5 0 0 1 5 5c0 3.5-5 8.5-5 8.5S3 10 3 6.5a5 5 0 0 1 5-5Z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle
              cx="8"
              cy="6.5"
              r="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
          <span>{form.event_address}</span>
        </div>
      )}
      {form.description && (
        <p className="text-[14px] text-[#262626] mt-[4px]">
          {form.description}
        </p>
      )}
    </div>
  );
}
