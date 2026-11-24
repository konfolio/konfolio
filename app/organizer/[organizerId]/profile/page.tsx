import OrganizerProfilePage from "@/components/organizer/OrganizerProfilePage";

export default async function OrganizerProfileRoute({
  params,
}: {
  params: Promise<{ organizerId: string }>;
}) {
  const { organizerId } = await params;

  return <OrganizerProfilePage organizerId={organizerId} />;
}