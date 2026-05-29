"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

import AutofillDrawer from "@/components/autofill/AutofillDrawer";
import StatusBanner from "@/components/StatusBanner";
import FieldRenderer, { Field } from "@/components/FieldRenderer";

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

export default function ApplyFormPage() {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<Form | null>(null);
  const [autofillData, setAutofillData] = useState<Record<string, string>>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [organizerName, setOrganizerName] = useState("");
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [organizerLinks, setOrganizerLinks] = useState<Record<string, string>>(
    {},
  );

  const totalPages = form
    ? Math.max(...(form.fields ?? []).map((f: any) => f.page ?? 1), 1)
    : 1;

  const isFieldVisible = (field: any): boolean => {
    if (!field.conditional) return true;
    const { fieldKey, value } = field.conditional;
    const dependsOn = form?.fields.find((f: any) => f.field_key === fieldKey);
    if (!dependsOn) return true;
    return responses[dependsOn.id] === value;
  };

  const currentFields = (form?.fields ?? []).filter(
    (f: any) => (f.page ?? 1) === currentPage && isFieldVisible(f),
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

        if (json.autofill) {
          setAutofillData(json.autofill);
        }

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

    const missing = currentFields.filter(
      (f: any) =>
        f.required &&
        (responses[f.id] === undefined ||
          responses[f.id] === "" ||
          responses[f.id] === null ||
          (Array.isArray(responses[f.id]) && responses[f.id].length === 0)),
    );

    if (missing.length > 0) {
      alert(
        `Please fill in all required fields: ${missing.map((f: any) => f.label).join(", ")}`,
      );
      return;
    }

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

  const handleAutofill = (data: Record<string, string>) => {
    if (!form) return;
    const newResponses: Record<string, any> = { ...responses };
    form.fields.forEach((field: any) => {
      if (field.field_key && data[field.field_key] !== undefined) {
        newResponses[field.id] = data[field.field_key];
      }
    });
    setResponses(newResponses);
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
          {/* Header row with Autofill button */}
          <div className="flex items-start justify-between gap-[16px]">
            <FormHeader form={form} />
            <button
              onClick={() => setAutofillOpen(true)}
              className="flex items-center gap-[6px] h-[34px] px-[16px] rounded-full bg-[#262626] text-[13px] text-white hover:opacity-80 shrink-0 mt-[6px]"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M8 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Autofill
            </button>
          </div>

          {autofillOpen && (
            <AutofillDrawer
              autofillData={autofillData}
              onClose={() => setAutofillOpen(false)}
              onAutofill={handleAutofill}
            />
          )}

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
                onClick={() => {
                  const missing = currentFields.filter(
                    (f: any) =>
                      f.required &&
                      (responses[f.id] === undefined ||
                        responses[f.id] === "" ||
                        responses[f.id] === null ||
                        (Array.isArray(responses[f.id]) &&
                          responses[f.id].length === 0)),
                  );
                  if (missing.length > 0) {
                    alert(
                      `Please fill in: ${missing.map((f: any) => f.label).join(", ")}`,
                    );
                    return;
                  }
                  setCurrentPage((p) => p + 1);
                }}
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
