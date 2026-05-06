// components/ApplicationDrawer.tsx
"use client";

import { useEffect } from "react";
import { AppRow } from "./ApplicationsTable";

export default function ApplicationDrawer({
  app,
  konfolioViewerBasePath,
  onClose,
}: {
  app: AppRow | null;
  konfolioViewerBasePath: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!app) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 h-full w-[480px] bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-zinc-800">
            {app.applicant.displayName ??
              app.applicant.firstName ??
              "Applicant"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            X
          </button>
        </div>

        <iframe
          src={`${konfolioViewerBasePath}/${app.konfolio.id}`}
          className="w-full h-[600px] border-0"
        />

        <div className="p-4 space-y-2 text-sm text-zinc-700">
          <div>{app.applicant.email}</div>
          <div>{app.applicant.location}</div>
          {/* status, notes, etc */}
        </div>
      </div>
    </>
  );
}
