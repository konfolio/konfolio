"use client";

import Navbar from "@/components/Navbar";
import OrganizerFormCard, { type FormRow } from "@/components/OrganizerFormCard";
import DashboardProfileHeader from "@/components/my-forms/dashboard/DashboardProfileHeader";
import { supabase } from "@/lib/supabase/browser";
import { useCallback, useEffect, useState } from "react";

export default function MyFormsPage() {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [error, setError] = useState("");

  const getUserForms = useCallback(async () => {
    try {
      const sessionRes = await supabase.auth.getSession();
      const userId = sessionRes.data.session?.user?.id;

      if (!userId) {
        console.warn("No user session found");
        return;
      }
      const res = await fetch("/api/forms/mine?organizerId=" + userId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error);

      setForms(json.forms);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load forms");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(getUserForms).catch(() => { });
  }, [getUserForms]);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      {/* Host Profile Header */}
      <DashboardProfileHeader formCount={forms.length} />

      <section className="w-full flex justify-center px-4 sm:px-8 lg:px-[150px] py-[40px]">
        <div className="w-full max-w-[1212px] grid grid-cols-1 gap-[30px]">
          {error && <p role="alert" className="text-red-600">{error}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            forms.map((form) => (
              <OrganizerFormCard key={form.id} form={form} onChanged={getUserForms} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
