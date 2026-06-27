import type { EligibleCreator } from "./types";

export function resolveCreatorRecipientEmail(
  creator: Pick<EligibleCreator, "email" | "ownerEmail">,
): string | null {
  const ownerEmail = creator.ownerEmail?.trim();
  if (ownerEmail) return ownerEmail;
  const creatorEmail = creator.email?.trim();
  return creatorEmail || null;
}
