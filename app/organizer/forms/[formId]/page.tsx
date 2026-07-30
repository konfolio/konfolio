"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ApplicationsTable, {
  AppRow,
  Field,
  Order,
  StatusFilter,
} from "@/components/organizer/ApplicationsTable";
import OrganizerFormHeader from "@/components/organizer/OrganizerFormHeader";

export default function OrganizerFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [fields, setFields] = useState<Field[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [formTitle, setFormTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<Order>("time_submitted");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [merchFilter, setMerchFilter] = useState<string[]>([]);
  const [noticeDateFilter, setNoticeDateFilter] = useState<string | null>(
    null,
  );

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    const res = await fetch(`/api/forms/${formId}/applications`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setFields([]);
      setApps([]);
      setErrorMsg(json?.error ?? `Request failed (${res.status})`);
      setLoading(false);
      return;
    }

    setFields(json.fields ?? []);
    setApps(json.applications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.form?.title) setFormTitle(json.form.title);
      })
      .catch(() => {});
  }, [formId]);

  async function updateStatus(id: string, status: AppRow["status"]) {
    setUpdatingId(id);
    setErrorMsg(null);

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const json = await res.json().catch(() => ({}));
    setUpdatingId(null);

    if (!res.ok) {
      setErrorMsg(json?.error ?? "Failed to update status");
      return;
    }

    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function handleDrawerUpdate(id: string, updates: Partial<AppRow>) {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }

  // "Earliest Notice Date" filter only makes sense on forms that actually
  // asked a date question — prefer the canonical field_key, fall back to
  // any date-type field so custom-labeled versions still work.
  const dateField = useMemo(
    () =>
      fields.find((f) => f.field_key === "latest_opening_date") ??
      fields.find((f) => f.type === "date") ??
      null,
    [fields],
  );

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of apps) {
      const loc = a.applicant.location?.trim();
      if (loc) set.add(loc);
    }
    return Array.from(set).sort();
  }, [apps]);

  const merchOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of apps) {
      for (const tag of a.applicant.tags ?? []) {
        if (tag) set.add(tag);
      }
    }
    return Array.from(set).sort();
  }, [apps]);

  const filteredApps = useMemo(() => {
    let result =
      statusFilter === "all"
        ? apps
        : apps.filter((a) => a.status === statusFilter);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((a) => {
        const haystack = [
          a.applicant.firstName,
          a.applicant.lastName,
          a.applicant.displayName,
          a.applicant.businessName,
          a.applicant.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (locationFilter.length > 0) {
      result = result.filter(
        (a) =>
          a.applicant.location && locationFilter.includes(a.applicant.location),
      );
    }

    if (merchFilter.length > 0) {
      result = result.filter((a) =>
        (a.applicant.tags ?? []).some((tag) => merchFilter.includes(tag)),
      );
    }

    if (noticeDateFilter && dateField) {
      result = result.filter((a) => {
        const raw = a.answers?.[dateField.field_key];
        if (!raw) return false;
        return String(raw).slice(0, 10) <= noticeDateFilter;
      });
    }

    const sorted = [...result];
    if (order === "alphabetical") {
      sorted.sort((a, b) => {
        const an = (
          a.applicant.businessName ||
          a.applicant.lastName ||
          ""
        ).toLowerCase();
        const bn = (
          b.applicant.businessName ||
          b.applicant.lastName ||
          ""
        ).toLowerCase();
        return an.localeCompare(bn);
      });
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return sorted;
  }, [
    apps,
    statusFilter,
    searchQuery,
    locationFilter,
    merchFilter,
    noticeDateFilter,
    dateField,
    order,
  ]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <div className="mx-auto w-full max-w-[1400px] px-10">
        <OrganizerFormHeader
          formId={formId}
          appCount={apps.length}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          order={order}
          onOrderChange={setOrder}
          locationOptions={locationOptions}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          merchOptions={merchOptions}
          merchFilter={merchFilter}
          onMerchFilterChange={setMerchFilter}
          noticeDateField={
            dateField ? { key: dateField.field_key, label: dateField.label } : null
          }
          noticeDateFilter={noticeDateFilter}
          onNoticeDateFilterChange={setNoticeDateFilter}
        />

        <div className="relative pb-10 pt-6">
          <ApplicationsTable
            apps={filteredApps}
            totalCount={apps.length}
            fields={fields}
            formTitle={formTitle}
            loading={loading}
            errorMsg={errorMsg}
            updatingId={updatingId}
            onStatusChange={updateStatus}
            onDrawerUpdate={handleDrawerUpdate}
            onReload={load}
          />
        </div>
      </div>
    </div>
  );
}
