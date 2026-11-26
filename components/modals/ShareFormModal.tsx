"use client";

// Need to connect to backend. API notes from Claude:
// GET /api/forms/:id/access returns { members: FormMember[] }
// POST /api/forms/:id/access takes { email, role } to invite someone
// PATCH /api/forms/:id/access/:memberId takes { role }; role is "viewer" or "editor"

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, User, X } from "lucide-react";

export type AccessRole = "owner" | "editor" | "viewer";
type EditableRole = Exclude<AccessRole, "owner">;

export type FormMember = {
  id: string;
  name: string | null;
  email: string;
  avatar_url?: string | null;
  role: AccessRole;
};

type Props = { open: boolean; formId: string; onClose: () => void };

const ROLE_OPTIONS: { value: EditableRole; label: string }[] = [
  { value: "viewer", label: "Can View" },
  { value: "editor", label: "Can Edit" },
];
const roleLabel = (role: EditableRole) => ROLE_OPTIONS.find((o) => o.value === role)?.label ?? "Can View";
const POPOVER_HEIGHT = 70; // 2 × 30px options + 10px padding

async function send(url: string, method: "GET" | "POST" | "PATCH", body?: object) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
  return json;
}

function Avatar({ src, className = "" }: { src?: string | null; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={40} height={40} className={`h-[40px] w-[40px] shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span aria-hidden className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#D3D3D3] p-[5px] text-white ${className}`}>
      <User size={30} strokeWidth={1.25} />
    </span>
  );
}

function RoleSelect({ value, onChange, disabled, label }: { value: EditableRole; onChange: (role: EditableRole) => void; disabled?: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  const place = useCallback(() => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return;
    const fitsBelow = r.bottom + 8 + POPOVER_HEIGHT <= window.innerHeight;
    setPos({ top: fitsBelow ? r.bottom + 8 : r.top - 8 - POPOVER_HEIGHT, right: window.innerWidth - r.right });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label={`${label}: ${roleLabel(value)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex shrink-0 items-center justify-end gap-[10px] rounded-[15px] text-right text-[15px] leading-[1.4] text-[#262626] focus-visible:outline-2 disabled:opacity-40"
      >
        {roleLabel(value)}
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
      </button>
      {open && pos && createPortal(
        <div
          ref={popRef}
          id={popId}
          role="menu"
          aria-label={label}
          onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); closeAndFocus(); } }}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-[60] flex w-[144px] flex-col items-center rounded-[15px] bg-white p-[5px] drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
        >
          {ROLE_OPTIONS.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                autoFocus={selected}
                onClick={() => { closeAndFocus(); if (!selected) onChange(o.value); }}
                className="flex h-[30px] w-full shrink-0 items-center gap-[10px] overflow-hidden rounded-[10px] px-[10px] text-left text-[14px] leading-[1.3] text-[#262626] hover:bg-[#F7F7F7] focus-visible:bg-[#F7F7F7] focus-visible:outline-none"
              >
                <Check size={14} strokeWidth={1.5} aria-hidden className={`shrink-0 ${selected ? "" : "invisible"}`} />
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

export default function ShareFormModal({ open, formId, onClose }: Props) {
  const [members, setMembers] = useState<FormMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<EditableRole>("viewer");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const titleId = useId();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await send(`/api/forms/${formId}/access`, "GET");
      setMembers(json.members ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load access.");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setInviteRole("viewer");
    setMessage("");
    void load();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open, load]);

  async function invite(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await send(`/api/forms/${formId}/access`, "POST", { email: value, role: inviteRole });
      setEmail("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to share this form.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(member: FormMember, role: EditableRole) {
    const previous = members;
    setMembers((ms) => ms.map((m) => (m.id === member.id ? { ...m, role } : m)));
    setMessage("");
    try {
      await send(`/api/forms/${formId}/access/${member.id}`, "PATCH", { role });
    } catch (error) {
      setMembers(previous);
      setMessage(error instanceof Error ? error.message : "Unable to update access.");
    }
  }

  if (!open || typeof document === "undefined") return null;

  const sorted = [...members].sort((a, b) => Number(b.role === "owner") - Number(a.role === "owner"));

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(e) => { if (e.key === "Escape" && !busy) onClose(); }}
        className="relative flex max-h-full w-full max-w-[757px] flex-col overflow-hidden rounded-[15px] bg-white px-5 pb-[30px] pt-[28px] text-[#262626] sm:px-[56px]"
      >
        <h2 id={titleId} className="mb-[24px] px-8 text-center text-[20px] leading-[1.4]">Share This Form</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          disabled={busy}
          className="absolute right-[20px] top-[20px] flex h-[26px] w-[26px] items-center justify-center rounded-full hover:opacity-70 focus-visible:outline-2"
        >
          <X size={26} strokeWidth={1.25} />
        </button>

        <div className="flex h-[331px] max-h-[calc(100vh-170px)] min-h-0 flex-col gap-[15px]">
          <form onSubmit={invite} className="flex h-[40px] shrink-0 items-center gap-[15px]">
            <div className="flex min-w-0 flex-1 items-center gap-[15px]">
              <Avatar className="hidden sm:flex" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                placeholder="Enter email to invite"
                aria-label="Email to invite"
                className="h-[24px] min-w-0 flex-1 border-b-[0.5px] border-black/40 bg-transparent text-[15px] leading-[1.4] text-[#262626] outline-none placeholder:text-[#D3D3D3] focus:border-[#262626]"
              />
            </div>
            <RoleSelect value={inviteRole} onChange={setInviteRole} disabled={busy} label="Invite permission" />
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="flex h-[28px] w-[80px] shrink-0 items-center justify-center rounded-[15px] bg-[#262626] text-[15px] leading-[1.4] text-[#F7F7F7] hover:opacity-90 disabled:opacity-40 sm:w-[109px]"
            >
              {busy ? "Sharing..." : "Share"}
            </button>
          </form>

          {message && <p role="alert" className="-mt-[5px] text-[12px] leading-[1.3] text-[#FF4603]">{message}</p>}

          <ul aria-label="People with access" aria-busy={loading} className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto overflow-x-hidden py-[5px]">
            {sorted.map((m) => (
              <li key={m.id} className="flex h-[40px] shrink-0 items-center gap-[15px]">
                <div className="flex min-w-0 flex-1 items-center gap-[15px]">
                  <Avatar src={m.avatar_url} />
                  <div className="flex min-w-0 flex-1 items-center gap-[5px]">
                    <span className="min-w-0 truncate text-[15px] leading-[1.4]">{m.name || m.email}</span>
                    {m.name && <span className="min-w-0 truncate text-[12px] leading-[1.3] text-black/40">({m.email})</span>}
                  </div>
                </div>
                {m.role === "owner" ? (
                  <span className="shrink-0 text-right text-[15px] leading-[1.4] text-black/40">Owner</span>
                ) : (
                  <RoleSelect value={m.role} onChange={(role) => void changeRole(m, role)} label={`Permission for ${m.name || m.email}`} />
                )}
              </li>
            ))}
            {loading && members.length === 0 && <li className="text-[14px] text-black/40">Loading...</li>}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}