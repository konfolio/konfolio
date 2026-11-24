import OrganizerHomePage from "@/components/organizer/OrganizerHomePage";

export default async function OrganizerPage({
  params,
}: {
  params: Promise<{ organizerId: string }>;
}) {
  const { organizerId } = await params;

  return <OrganizerHomePage organizerId={organizerId} />;
}