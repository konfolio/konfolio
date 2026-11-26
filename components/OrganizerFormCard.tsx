"use client";

import Link from "next/link";
import { useId, useRef, useState, type ReactNode } from "react";
import { Copy, Link as LinkIcon, MoreVertical, Pencil, Trash2, UserPlus, type LucideIcon } from "lucide-react";
import TimeIcon from "@/components/icons/TimeIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import UserIcon from "@/components/icons/UserIcon";
import HoverTag from "@/components/my-portfolios/dashboard/HoverTag";
import PortfolioDeleteConfirm from "@/components/my-portfolios/dashboard/PortfolioDeleteConfirm";
import useClickOutside from "@/components/hooks/useClickOutside";
import ShareFormModal from "@/components/modals/ShareFormModal";

export type FormRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  event_date_start?: string | null;
  public_url?: string | null;
  slug?: string | null;
  views: number;
  applications_count: number;
};

type Props = {
  form: FormRow;
  onChanged?: () => void | Promise<void>;
  onShareAccess?: (form: FormRow) => void;
};

function Metric({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <span tabIndex={0} aria-describedby={id} className="group/metric relative inline-flex items-center gap-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#A5A5A5] rounded-sm">
      {children}
      <span id={id} role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-[14px] -translate-x-1/2 opacity-0 transition-opacity group-hover/metric:opacity-100 group-focus-visible/metric:opacity-100">
        <HoverTag label={label} />
      </span>
    </span>
  );
}

type MenuItemProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
};

function MenuItem({ icon: Icon, label, onClick, danger, autoFocus, disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      autoFocus={autoFocus}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[30px] w-full shrink-0 items-center gap-[10px] overflow-hidden rounded-[10px] px-[10px] text-left text-[14px] leading-[1.3] hover:bg-[#F7F7F7] focus-visible:bg-[#F7F7F7] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${danger ? "text-[#FF4603]" : "text-[#262626]"}`}
    >
      <Icon size={14} strokeWidth={1.5} aria-hidden className={`shrink-0 ${danger ? "" : "text-black/40"}`} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

export default function OrganizerFormCard({ form, onChanged }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(form.title);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  useClickOutside(menuRef, () => setMenuOpen(false), { enabled: menuOpen });

  const status = form.status === "receiving" ? "Receiving" : form.status === "draft" ? "Draft" : form.status === "closed" ? "Closed" : form.status === "inactive" ? "Inactive · Limit Reached" : "Inactive";
  const editedDate = new Date(form.updated_at || form.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).replace(/^([A-Za-z]{3}) /, "$1. ");
  const year = new Date(form.event_date_start || form.created_at).getFullYear();

  async function mutate(method: "PATCH" | "POST" | "DELETE", body?: object) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to update form");
      setEditing(false);
      setDeleteOpen(false);
      setMenuOpen(false);
      await onChanged?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update form");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    setMenuOpen(false);
    const path = form.public_url || (form.slug ? `/apply/${form.slug}` : null);
    if (!path) {
      setMessage("Publish this form first to get its public URL.");
      return;
    }
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      setMessage("Form URL copied.");
    } catch {
      setMessage("Unable to copy the form URL. Please try again.");
    }
  }

  return (
    <article className="relative flex w-full min-w-0 gap-[12px] rounded-[20px] bg-white p-[14px] text-[#262626] shadow-[0_3px_12px_rgba(0,0,0,0.06)] sm:gap-[16px]">
      <Link href={`/organizer/forms/${form.id}`} aria-label={`View applications for ${form.title}`} className="flex min-h-[116px] w-[72px] shrink-0 items-center justify-center rounded-[14px] bg-[#F7F7F7] text-[28px] font-semibold text-[#999999] sm:w-[100px] sm:text-[32px]">
        {year}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-[14px] py-[3px]">
        <div className="flex min-h-[20px] items-center justify-between gap-3">
          <span className="inline-flex items-center gap-[9px] text-[15px] leading-[140%]">
            <span className={`h-[12px] w-[12px] shrink-0 rounded-full ${form.status === "receiving" ? "bg-[#00CC00]" : "bg-[#A5A5A5]"}`} />
            {status}
          </span>
          <div ref={menuRef} className="relative shrink-0">
            <button ref={menuButtonRef} type="button" aria-label={`More options for ${form.title}`} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuId} onClick={() => setMenuOpen(!menuOpen)} className="flex h-[24px] w-[24px] items-center justify-center rounded-full hover:bg-[#F7F7F7] focus-visible:outline-2" disabled={busy}>
              <MoreVertical size={20} strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                aria-label="Form options"
                onKeyDown={(e) => { if (e.key === "Escape") { setMenuOpen(false); menuButtonRef.current?.focus(); } }}
                className="absolute right-0 top-[32px] z-30 flex w-[224px] flex-col gap-[5px] rounded-[15px] bg-white p-[10px] drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
              >
                <MenuItem icon={UserPlus} label="Share Access" autoFocus onClick={() => { setMenuOpen(false); setShareOpen(true); }} />
                <MenuItem icon={LinkIcon} label="Copy Form URL" onClick={() => void copyUrl()} />
                <MenuItem icon={Pencil} label="Edit Name" onClick={() => { setTitle(form.title); setEditing(true); setMenuOpen(false); }} />
                <div role="separator" className="flex h-[20px] shrink-0 items-center">
                  <span className="h-px w-full bg-[#D3D3D3]" />
                </div>
                <MenuItem icon={Copy} label="Duplicate" onClick={() => void mutate("POST")} />
                <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setMenuOpen(false); setDeleteOpen(true); }} />
              </div>
            )}
          </div>
        </div>
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) void mutate("PATCH", { title: title.trim() }); }} className="flex flex-wrap items-center gap-2">
            <input autoFocus aria-label="Form name" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }} required disabled={busy} className="w-full min-w-0 border-b border-[#A5A5A5] bg-transparent text-[20px] outline-none" />
            <button type="submit" disabled={busy || !title.trim()} className="text-sm underline disabled:opacity-40">{busy ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => setEditing(false)} disabled={busy} className="text-sm text-[#999999]">Cancel</button>
          </form>
        ) : (
          <Link href={`/organizer/forms/${form.id}`} className="truncate text-[20px] leading-[140%]">{form.title}</Link>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[10px] text-[13px] sm:text-[14px]">
          <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[10px]">
            <Metric label="Last Edited"><TimeIcon size={20} /><span>{editedDate}</span></Metric>
            <Metric label="Visitors"><EyeIcon size={20} /><span>{form.views ?? 0}</span></Metric>
            <Metric label="Submissions"><UserIcon size={20} /><span>{form.applications_count ?? 0}</span></Metric>
          </div>
          <Link href={`/organizer/forms/${form.id}/edit`} className="shrink-0 underline underline-offset-[4px] hover:opacity-70">Edit Form</Link>
        </div>
        {message && <p role="alert" className="absolute left-[16px] right-[16px] top-full mt-[4px] text-[13px] text-[#666666]">{message}</p>}
        {busy && !editing && <p role="status" className="sr-only">Updating form...</p>}
      </div>
      <PortfolioDeleteConfirm open={deleteOpen} onClose={() => { if (!busy) setDeleteOpen(false); }} onCancel={() => setDeleteOpen(false)} onConfirmDelete={() => void mutate("DELETE")} title="Delete this form?" subtitle="This form and its submissions cannot be recovered after deletion." isDeleting={busy} />
      <ShareFormModal open={shareOpen} formId={form.id} onClose={() => { setShareOpen(false); menuButtonRef.current?.focus(); }} />
    </article>
  );
}