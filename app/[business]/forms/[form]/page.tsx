"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicFormPage() {
  const { organizerSlug, formSlug } = useParams();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const fetchForm = async () => {
      const res = await fetch(
        `/api/forms/public?organizerSlug=${organizerSlug}&formSlug=${formSlug}`,
      );
      const json = await res.json();
      setForm(json.form);
    };
    fetchForm();
  }, [organizerSlug, formSlug]);

  if (!form) return <div>Loading...</div>;

  return (
    <main>
      <h1>{form.title}</h1>
      {/* render form fields */}
    </main>
  );
}
