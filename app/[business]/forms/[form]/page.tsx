"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FormField = {
  id: string;
  field_key?: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  sortOrder?: number;
};

export default function PublicFormPage() {
  const { business: organizerSlug, form: formSlug } = useParams();

  const [form, setForm] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(
          `/api/forms/public?organizerSlug=${organizerSlug}&formSlug=${formSlug}`,
        );

        const json = await res.json();

        setForm(json.form);

        // Autofill answers, but only if backend returns them
        if (json.autofill) {
          setAnswers((prev) => ({
            ...json.autofill,
            ...prev,
          }));
        }
      } catch (error) {
        console.error("Error fetching public form:", error);
      } finally {
        setLoading(false);
      }
    };

    if (organizerSlug && formSlug) {
      fetchForm();
    } else {
      setLoading(false);
    }
  }, [organizerSlug, formSlug]);

  const updateAnswer = (fieldId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const renderField = (field: FormField) => {
    const value = answers[field.id] ?? "";

    if (field.type === "long_text") {
      return (
        <textarea
          value={value}
          required={field.required}
          placeholder={field.placeholder || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      );
    }

    if (field.type === "multiple_choice") {
      return (
        <div className="space-y-2">
          {(field.options || []).map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                name={field.id}
                value={option}
                checked={value === option}
                required={field.required}
                onChange={(e) => updateAnswer(field.id, e.target.value)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "checkbox") {
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <div className="space-y-2">
          {(field.options || []).map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={option}
                checked={selectedValues.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateAnswer(field.id, [...selectedValues, option]);
                  } else {
                    updateAnswer(
                      field.id,
                      selectedValues.filter((item) => item !== option),
                    );
                  }
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <input
        type="text"
        value={value}
        required={field.required}
        placeholder={field.placeholder || ""}
        onChange={(e) => updateAnswer(field.id, e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
      />
    );
  };

  if (loading) return <div>Loading...</div>;

  if (!form) return <div>Form not found.</div>;

  const fields = [...(form.fields || [])].sort(
    (a: FormField, b: FormField) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{form.title}</h1>

      {form.description && (
        <p className="mt-3 text-zinc-600">{form.description}</p>
      )}

      <form className="mt-8 space-y-6">
        {fields.map((field: FormField) => (
          <div key={field.id} className="space-y-2">
            <label className="block font-medium">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>

            {renderField(field)}
          </div>
        ))}

        <button
          type="submit"
          className="rounded-full bg-black px-6 py-3 text-white"
        >
          Submit Application
        </button>
      </form>
    </main>
  );
}