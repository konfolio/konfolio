"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CreateFormWizard from "@/components/organizer/CreateFormWizard";
import {
  CalendarDays,
  Eye,
  FileText,
  Search,
  MoreVertical,
  Pencil,
} from "lucide-react";

type OrganizerProfile = {
  id: string;
  name: string;
  location: string;
  avatar_url: string | null;
};

type FormRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  close_date?: string | null;
  views: number;
  applications_count: number;
};

type Props = {
  organizerId: string;
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "No date";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "receiving":
      return {
        text: "Receiving",
        dot: "bg-green-500",
        textColor: "text-neutral-800",
      };
    case "inactive":
      return {
        text: "Inactive - Limit Reached",
        dot: "bg-neutral-400",
        textColor: "text-neutral-700",
      };
    case "closed":
      return {
        text: "Closed",
        dot: "bg-neutral-400",
        textColor: "text-neutral-700",
      };
    default:
      return {
        text: "Draft",
        dot: "bg-neutral-400",
        textColor: "text-neutral-700",
      };
  }
}

export default function OrganizerHomePage({ organizerId }: Props) {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/forms/mine?organizerId=${encodeURIComponent(organizerId)}`
        );
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error);

        if (!ignore) {
          setProfile(json.profile);
          setForms(json.forms || []);
        }
      } catch (err: any) {
        if (!ignore) setError(err?.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (organizerId) load();

    return () => {
      ignore = true;
    };
  }, [organizerId]);

  const filteredForms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return forms;
    return forms.filter((f) => f.title.toLowerCase().includes(q));
  }, [forms, search]);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="mx-auto w-full max-w-[1400px] px-8 py-10">
        {/* HEADER */}
        <div className="mb-10 flex justify-between">
          <div className="flex gap-4">
            <div className="h-24 w-24 rounded-full bg-neutral-200" />

            <div>
              <h1 className="text-3xl font-semibold">
                {profile?.name || "Organization Name"}
              </h1>
              <p className="text-neutral-500">
                {profile?.location || "City, Country"}
              </p>

              <Link href="/profile/edit" className="text-sm underline mt-2 inline-block">
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-neutral-400">
              {forms.length.toString().padStart(2, "0")} forms
            </p>

          <button
            onClick={() => setOpen(true)}
            className="mt-2 inline-block rounded-full border border-black bg-white px-5 py-2 text-sm font-normal text-black transition hover:bg-white"
              >
              + Create
            </button>

      <CreateFormWizard
        open={open}
        onClose={() => setOpen(false)}
      />
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <div className="flex h-14 max-w-[420px] items-center gap-3 rounded-full bg-white px-5 shadow-sm">
            <Search className="h-5 w-5 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search forms"
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredForms.map((form) => {
              const status = getStatusLabel(form.status);

              return (
                <Link key={form.id} href={`/organizer/forms/${form.id}`}>
                  <div className="flex rounded-[28px] bg-white p-4 shadow-sm hover:shadow-md transition">

                    {/* LEFT YEAR BOX */}
                    <div className="flex h-[150px] w-[140px] items-center justify-center rounded-[28px] bg-neutral-100 text-[80px] font-semibold text-neutral-300">
                      {new Date(form.created_at).getFullYear()}
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="ml-4 flex flex-col flex-1">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          <span className="text-sm">{status.text}</span>
                        </div>
                        <MoreVertical />
                      </div>

                      <h2 className="text-3xl mt-2 font-medium">
                        {form.title}
                      </h2>

                      <div className="mt-auto flex gap-6 text-sm">
                        <div className="flex gap-2 items-center">
                          <CalendarDays size={16} />
                          {formatDate(form.created_at)}
                        </div>

                        <div className="flex gap-2 items-center">
                          <Eye size={16} />
                          {form.views}
                        </div>

                        <div className="flex gap-2 items-center">
                          <FileText size={16} />
                          {form.applications_count}
                        </div>

                        <span className="ml-auto underline">
                          View Applications
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}