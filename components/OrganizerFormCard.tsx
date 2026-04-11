import Link from "next/link";

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
  form: FormRow;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

function StatusBadge({ status }: { status: string }) {
  const isReceiving = status === "receiving";
  return (
    <span
      className={`inline-flex items-center gap-[5px] text-[12px] px-[8px] py-[2px] rounded-full ${
        isReceiving
          ? "bg-[#EAF3DE] text-[#3B6D11]"
          : "bg-[#F1EFE8] text-[#5F5E5A]"
      }`}
    >
      <span
        className={`w-[6px] h-[6px] rounded-full shrink-0 ${
          isReceiving ? "bg-[#639922]" : "bg-[#888780]"
        }`}
      />
      {isReceiving ? "Receiving" : "Inactive · Limit Reached"}
    </span>
  );
}

export default function OrganizerFormCard({ form }: Props) {
  return (
    <div className="w-full bg-white border-[0.5px] border-[#E9E9E9] rounded-[12px] p-[16px_20px] flex items-start gap-[16px]">
      <Link
        href={`/organizer/forms/${form.id}`}
        className="flex items-start gap-[16px] flex-1 min-w-0"
      >
        <div className="text-[28px] font-medium text-[#C0BDB4] min-w-[64px] text-center shrink-0 pt-[2px]">
          {getYear(form.created_at)}
        </div>

        <div className="flex flex-col gap-[6px] flex-1 min-w-0">
          <div className="flex items-start">
            <StatusBadge status={form.status} />
          </div>
          <div className="text-[15px] font-medium text-[#262626] truncate">
            {form.title}
          </div>
          <div className="flex items-center gap-[14px] text-[12px] text-[#A5A5A5]">
            <span className="flex items-center gap-[4px]">
              🕐 {formatDate(form.created_at)}
            </span>
            <span className="flex items-center gap-[4px]">
              👤 {form.applications_count ?? 0}
            </span>
            <span className="flex items-center gap-[4px]">
              📋 {form.views ?? 0}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col items-end gap-[4px] shrink-0">
        <button className="text-[#A5A5A5] text-[18px] leading-none px-[4px] hover:opacity-70">
          ⋯
        </button>
        <Link
          href={`/forms/${form.id}/edit`}
          className="text-[13px] text-[#262626] border-b border-[#C0BDB4] pb-[1px] hover:opacity-70"
        >
          Edit Form
        </Link>
      </div>
    </div>
  );
}
