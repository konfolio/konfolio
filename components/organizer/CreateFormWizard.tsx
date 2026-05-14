"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

type WizardData = {
  title: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  location: string;
};

export default function CreateFormWizard({ open, onClose }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<WizardData>({
    title: "",
    startDate: "",
    endDate: "",
    isRecurring: false,
    location: "",
  });

  useEffect(() => {
    if (!open) {
      setStep(1);
      setLoading(false);
      setData({
        title: "",
        startDate: "",
        endDate: "",
        isRecurring: false,
        location: "",
      });
    }
  }, [open]);

  if (!open) return null;

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    if (step === 1) {
      if (!data.title.trim()) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!data.startDate || !data.endDate) return;
      setStep(3);
    }
  }

  function goBack() {
    if (step === 1) return;
    setStep((prev) => (prev === 3 ? 2 : 1));
  }

  async function handleCreate() {
    if (!data.location.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/forms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to create form");
        return;
      }

      onClose();
      router.push(`/organizer/forms/${json.formId}`);
    } catch {
      alert("Something went wrong creating the form");
    } finally {
      setLoading(false);
    }
  }

  const titleText =
    step === 1 ? "Create Form" : step === 2 ? "Event Dates" : "Location";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.16)" }}
    >
      <div
        className="relative bg-white"
        style={{
          width: "780px",
          height: "420px",
          maxWidth: "92vw",
          maxHeight: "88vh",
          borderRadius: "24px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute text-black"
          style={{
            top: "22px",
            right: "24px",
            fontSize: "34px",
            lineHeight: 1,
            fontWeight: 300,
          }}
        >
          ×
        </button>

        {step !== 1 && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="absolute text-black"
            style={{
              top: "22px",
              left: "24px",
              fontSize: "34px",
              lineHeight: 1,
              fontWeight: 300,
            }}
          >
            ←
          </button>
        )}

        <div className="flex h-full flex-col items-center">
          <h1
            className="text-black"
            style={{
              paddingTop: "44px",
              fontSize: "22px",
              fontWeight: 400,
            }}
          >
            {titleText}
          </h1>

          {step === 1 && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <input
                value={data.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Untitled Form"
                className="bg-transparent text-center text-black outline-none"
                style={{
                  width: "395px",
                  border: "none",
                  borderBottom: "1px solid #b8b8b8",
                  paddingBottom: "12px",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#111111",
                }}
              />

              <button
                type="button"
                onClick={goNext}
                className="text-white"
                style={{
                  marginTop: "72px",
                  backgroundColor: "#1f1f1f",
                  borderRadius: "9999px",
                  padding: "12px 44px",
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                style={{
                  width: "470px",
                  borderBottom: "1px solid #b8b8b8",
                  paddingBottom: "12px",
                }}
              >
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="date"
                    value={data.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    className="bg-transparent text-center text-black outline-none"
                    style={{
                      width: "180px",
                      fontSize: "22px",
                      fontWeight: 400,
                    }}
                  />

                  <span
                    style={{
                      fontSize: "22px",
                      color: "#bdbdbd",
                    }}
                  >
                    -
                  </span>

                  <input
                    type="date"
                    value={data.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                    className="bg-transparent text-center text-black outline-none"
                    style={{
                      width: "180px",
                      fontSize: "22px",
                      fontWeight: 400,
                    }}
                  />
                </div>
              </div>

              <label
                className="flex items-center gap-3"
                style={{
                  width: "470px",
                  marginTop: "28px",
                  fontSize: "17px",
                  color: "#8f8f8f",
                  fontWeight: 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={data.isRecurring}
                  onChange={(e) => update("isRecurring", e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "black",
                  }}
                />
                Regular recurrence
              </label>

              <button
                type="button"
                onClick={goNext}
                className="text-white"
                style={{
                  marginTop: "56px",
                  backgroundColor: "#1f1f1f",
                  borderRadius: "9999px",
                  padding: "12px 44px",
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                Next →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <input
                value={data.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Event Address"
                className="bg-transparent text-center text-black outline-none"
                style={{
                  width: "395px",
                  border: "none",
                  borderBottom: "1px solid #b8b8b8",
                  paddingBottom: "12px",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#111111",
                }}
              />

              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="text-white disabled:opacity-50"
                style={{
                  marginTop: "72px",
                  backgroundColor: "#1f1f1f",
                  borderRadius: "9999px",
                  padding: "12px 44px",
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {loading ? "Creating..." : "Create →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
