"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CreateFormWizard from "@/components/organizer/CreateFormWizard";
import OrganizerProfilePage from "@/components/organizer/OrganizerProfilePage";

import {
  CalendarDays,
  Eye,
  FileText,
  Search,
  MoreVertical,
  MapPin,
} from "lucide-react";

type OrganizerProfile = {
  id: string;
  name: string;
  location: string;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  email?: string | null;
  forms_count?: number;
  applications_count?: number;
  sales_locations?: string[];
  links?: Record<string, string> | null;
  member_since?: string | null;
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
      };
    case "inactive":
      return {
        text: "Inactive - Limit Reached",
        dot: "bg-neutral-400",
      };
    case "closed":
      return {
        text: "Closed",
        dot: "bg-neutral-400",
      };
    default:
      return {
        text: "Draft",
        dot: "bg-neutral-400",
      };
  }
}

export default function OrganizerHomePage({ organizerId }: Props) {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/forms/mine?organizerId=${encodeURIComponent(organizerId)}`
        );
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Failed to load organizer");

        if (!ignore) {
          setProfile(json.profile ?? json.pprofile ?? null);
          setForms(json.forms || []);
        }
      } catch (err: any) {
        if (!ignore) setError(err?.message || "Something went wrong");
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

  const profileImage =
    profile?.profile_image_url || profile?.avatar_url || null;

  return (
    <>
      <div className="min-h-screen bg-[#f7f7f7]">
        <div className="mx-auto w-full max-w-[1400px] px-8 py-10">
          <div className="mb-10 flex justify-between gap-6">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex gap-4 text-left transition hover:opacity-80"
            >
              <div className="h-24 w-24 overflow-hidden rounded-full bg-neutral-200">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profile?.name || "Organization"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-neutral-900">
                  {profile?.name || "Organization Name"}
                </h1>

                <div className="mt-1 flex items-center gap-2 text-neutral-500">
                  <MapPin className="h-4 w-4" />
                  <p>{profile?.location || "City, Country"}</p>
                </div>

                <span className="mt-2 inline-block text-sm underline">
                  View Profile
                </span>
              </div>
            </button>

            <div className="text-right">
              <p className="text-sm text-neutral-400">
                {forms.length.toString().padStart(2, "0")} forms
              </p>

              <button
                onClick={() => setCreateOpen(true)}
                className="mt-2 inline-block rounded-full border border-black bg-white px-5 py-2 text-sm font-normal text-black transition hover:bg-neutral-50"
              >
                + Create
              </button>

              <CreateFormWizard
                open={createOpen}
                onClose={() => setCreateOpen(false)}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex h-14 max-w-[420px] items-center gap-3 rounded-full bg-white px-5 shadow-sm">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {filteredForms.map((form) => {
                const status = getStatusLabel(form.status);

                return (
                  <Link key={form.id} href={`/organizer/forms/${form.id}`}>
                    <div className="flex rounded-[28px] bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex h-[150px] w-[140px] items-center justify-center rounded-[28px] bg-neutral-100 text-[80px] font-semibold text-neutral-300">
                        {new Date(form.created_at).getFullYear()}
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${status.dot}`}
                            />
                            <span className="text-sm">{status.text}</span>
                          </div>
                          <MoreVertical />
                        </div>

                        <h2 className="mt-2 text-3xl font-medium">
                          {form.title}
                        </h2>

                        <div className="mt-auto flex gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            {formatDate(form.created_at)}
                          </div>

                          <div className="flex items-center gap-2">
                            <Eye size={16} />
                            {form.views}
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            {form.applications_count}
                          </div>
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

      {profileOpen ? (
        
        <OrganizerProfilePage
          organizerId={organizerId}
          isPopup={true}
          onClose={() => setProfileOpen(false)}
        />
      ) : null}
    </>
  );
}