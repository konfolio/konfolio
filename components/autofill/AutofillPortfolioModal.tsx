"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import OpenTabIcon from "@/components/icons/OpenTabIcon";
import TimeIcon from "@/components/icons/TimeIcon";

export type AutofillPortfolio = {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    updatedAt: string;
    href: string;
};

type Props = {
    portfolios: AutofillPortfolio[];
    loading: boolean;
    businessName: string;
    displayName: string;
    avatarUrl: string | null;
    createDisabled: boolean;
    limitReached: boolean;
    onCreate: () => void;
    onSelect: (id: string) => void;
    onClose: () => void;
};

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not edited yet" : date.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

export default function AutofillPortfolioModal({ portfolios, loading, businessName, displayName, avatarUrl, createDisabled, limitReached, onCreate, onSelect, onClose }: Props) {
    const headingId = useId();
    const descriptionId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
            if (event.key !== "Tab") return;
            const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
                'button:not(:disabled), a[href], [tabindex="0"]',
            ) ?? []).filter((element) => element.getClientRects().length > 0);
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!first) { event.preventDefault(); dialogRef.current?.focus(); return; }
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1C1C1C]/95 px-[16px] py-[24px] md:px-[30px]"
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId} aria-describedby={descriptionId} tabIndex={-1}
                className="flex max-h-[calc(100dvh-48px)] w-full max-w-[900px] min-h-0 flex-col outline-none">
                <h2 id={headingId} className="mb-[14px] shrink-0 text-[16px] font-normal leading-[140%] text-white/40">Select Autofill</h2>
                <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[16px] bg-[#F7F7F7] md:rounded-[12px]">
                    <button ref={closeRef} type="button" onClick={onClose} aria-label="Close autofill"
                        className="absolute right-[20px] top-[20px] z-20 flex h-[24px] w-[24px] items-center justify-center text-[#262626] hover:opacity-60 focus-visible:outline-2 md:right-[20px] md:top-[18px]">
                        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M17 3L3 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    </button>

                    <div className="min-h-0 overflow-y-auto overscroll-contain px-[24px] pb-[24px] pt-[24px] md:px-[80px]">
                        <div className="flex min-w-0 items-center gap-[12px] pr-[28px]">
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt="Your profile" width={40} height={40} className="h-[40px] w-[40px] shrink-0 rounded-full object-cover md:h-[36px] md:w-[36px]" />
                            ) : <div aria-hidden="true" className="h-[40px] w-[40px] shrink-0 rounded-full bg-[#D9D9D9] md:h-[36px] md:w-[36px]" />}
                            <div className="min-w-0">
                                <p className="truncate text-[16px] font-normal leading-[140%] text-black md:text-[14px]">{businessName || "Business Name"}</p>
                                <p className="truncate text-[13px] leading-[140%] text-black/40 md:text-[12px]">{displayName || "Preferred (First Last)"}</p>
                            </div>
                        </div>

                        <div className="mb-[24px] mt-[24px] flex items-center justify-between gap-[16px]">
                            <p id={descriptionId} className="text-[14px] leading-[150%] text-black md:text-[13px]">Select a portfolio to use as autofill.</p>
                            <button type="button" disabled={createDisabled}
                                title={limitReached ? "You have reached the 3-portfolio limit." : "Create a portfolio in a new tab"}
                                onClick={() => { if (!createDisabled) onCreate(); }}
                                className="hidden h-[24px] min-w-[100px] shrink-0 items-center justify-center gap-[4px] rounded-full border border-[#262626] px-[16px] text-[12px] text-[#262626] hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 md:inline-flex">
                                <span aria-hidden="true">+</span> Create
                            </button>
                        </div>

                        <div aria-busy={loading} className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[16px]">
                            {loading && <p role="status" className="col-span-full py-[32px] text-center text-[14px] text-black/40">Loading portfolios...</p>}
                            {!loading && portfolios.length === 0 && <p role="status" className="col-span-full py-[32px] text-center text-[14px] text-black/40">No published portfolios found.</p>}
                            {portfolios.map((portfolio) => (
                                <article key={portfolio.id} className="relative min-w-0 rounded-[16px] bg-white p-[12px] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-black/30">
                                    <button type="button" onClick={() => onSelect(portfolio.id)} aria-label={`Use ${portfolio.name} for autofill`} className="absolute inset-0 z-[1] rounded-[16px] outline-none"><span className="sr-only">Use {portfolio.name} for autofill</span></button>
                                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[10px] border-[3px] border-white bg-[#F7F7F7] shadow-[0_0_10px_rgba(0,0,0,0.04)] md:aspect-[8/5]">
                                        {portfolio.thumbnailUrl ? (
                                            <Image src={portfolio.thumbnailUrl} alt={`${portfolio.name} preview`} fill sizes="(min-width: 768px) 420px, 90vw" className="object-cover object-top" />
                                        ) : <div role="img" aria-label="No portfolio preview available" className="absolute inset-0" style={{ backgroundImage: "repeating-conic-gradient(#EBEBEB 0% 25%, #F7F7F7 0% 50%)", backgroundSize: "40px 40px" }} />}
                                    </div>
                                    <p className="mb-[10px] mt-[12px] truncate text-[16px] leading-[140%] text-[#262626] md:text-[14px]">{portfolio.name}</p>
                                    <div className="flex min-w-0 items-center justify-between gap-[10px]">
                                        <span className="inline-flex min-w-0 items-center gap-[4px] text-[12px] text-black/40"><TimeIcon size={16} className="shrink-0" /><span className="truncate">{formatDate(portfolio.updatedAt)}</span></span>
                                        {portfolio.href && <Link href={portfolio.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${portfolio.name} in a new tab`}
                                            className="relative z-[2] flex h-[22px] min-w-[100px] shrink-0 items-center justify-center gap-[5px] rounded-full bg-[#262626] px-[16px] text-[12px] text-white hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 md:h-[20px]">
                                            View <OpenTabIcon className="h-[12px] w-[12px]" />
                                        </Link>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
