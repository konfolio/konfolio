import Link from "next/link";

export default function StatusBanner({
  formTitle,
  organizerName,
  organizerLinks,
  closed,
}: {
  formTitle: string;
  organizerName: string;
  organizerLinks: Record<string, string>;
  closed: boolean;
}) {
  return (
    <div className="w-full bg-white rounded-[16px] border-[0.5px] border-[#E9E9E9] px-[24px] py-[20px] flex flex-col gap-[10px]">
      <p className="text-[14px] text-[#262626]">
        {closed ? (
          <>
            <span className="font-semibold">{formTitle}</span> is no longer
            accepting applications.
          </>
        ) : (
          <>
            Your application has been successfully submitted to{" "}
            <span className="font-semibold">{formTitle}</span>!
          </>
        )}
      </p>
      <p className="text-[13px] text-[#A5A5A5]">
        Stay updated with {organizerName || "Organization Name"} here:
      </p>
      <div className="flex items-center gap-[14px]">
        {organizerLinks.website && (
          <Link
            href={organizerLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="1.5"
                y="1.5"
                width="15"
                height="15"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M1.5 9h15M9 1.5C9 1.5 6.5 4.5 6.5 9s2.5 7.5 2.5 7.5M9 1.5C9 1.5 11.5 4.5 11.5 9S9 16.5 9 16.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}
        {organizerLinks.instagram && (
          <Link
            href={organizerLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="1.5"
                y="1.5"
                width="15"
                height="15"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle
                cx="9"
                cy="9"
                r="3"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="13" cy="5" r="0.75" fill="currentColor" />
            </svg>
          </Link>
        )}
        {organizerLinks.x && (
          <Link
            href={organizerLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2l14 14M16 2L2 16"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}
        {organizerLinks.facebook && (
          <Link
            href={organizerLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#262626] hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M12 2h-2a3 3 0 0 0-3 3v2H5v3h2v6h3v-6h2l1-3h-3V5a1 1 0 0 1 1-1h2V2Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
