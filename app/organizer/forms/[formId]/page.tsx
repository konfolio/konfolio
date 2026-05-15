import Navbar from "@/components/Navbar";
import ApplicationsTable from "@/components/organizer/ApplicationsTable";
import OrganizerFormHeader from "@/components/organizer/OrganizerFormHeader";

export default async function OrganizerFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <div className="mx-auto w-full max-w-[1400px] px-10">
        <OrganizerFormHeader formId={formId} />

        <div className="pb-10 pt-6">
          <ApplicationsTable
            formId={formId}
            konfolioViewerBasePath="/konfolios"
          />
        </div>
      </div>
    </div>
  );
}
