import ApplyFormClient from "@/components/forms/ApplyFormClient";

export default async function FormPreviewPage({
    params,
}: {
    params: Promise<{ formId: string }>;
}) {
    const { formId } = await params;
    // Preview data comes from the authenticated, owner-only /api/forms/[formId] endpoint.
    return <ApplyFormClient key={formId} mode="preview" previewFormId={formId} />;
}