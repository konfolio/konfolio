export function publicFormUrl(
  organizerSlug: string,
  formSlug: string,
) {
  return `/${encodeURIComponent(organizerSlug)}/${encodeURIComponent(formSlug)}`;
}

export function isPublicFormStatus(
  status: string | null | undefined,
) {
  return status === "receiving" || status === "closed";
}