import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { creatorStubOutreachEmails, creators, type Creator } from "../../db/schema";
import { generateWelcomeEmail } from "../dashboard/admin/creators/emails";
import { markWelcomeEmailSentAdmin } from "../dashboard/admin/creators/services";
import { sendEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import { stubClaimStartUrl } from "./urls";

type WelcomeError = { reason: string; cause?: unknown };

export type SendStubWelcomeEmailOptions = {
  to?: string;
};

export { stubClaimStartUrl } from "./urls";

export async function sendStubWelcomeEmail(
  creator: Pick<
    Creator,
    "id" | "email" | "displayName" | "slug" | "ownerUserId"
  >,
  options: SendStubWelcomeEmailOptions = {},
): Promise<Result<{ to: string }, WelcomeError>> {
  const recipient = options.to?.trim() || creator.email?.trim();
  if (!recipient) {
    return err({ reason: "Creator has no email" });
  }

  const claimLink = stubClaimStartUrl(creator.id);
  const html = generateWelcomeEmail(
    { ...creator, displayName: creator.displayName } as Creator,
    claimLink,
  );
  const subject = `Hi ${creator.displayName}! Invitation to Photobookers`;
  const [emailError] = await sendEmail(recipient, subject, html);
  if (emailError) {
    return err({ reason: emailError.reason });
  }

  const [markError] = await markWelcomeEmailSentAdmin(creator.id);
  if (markError) {
    return err({ reason: markError.reason });
  }

  await db.insert(creatorStubOutreachEmails).values({
    creatorId: creator.id,
    kind: "welcome",
  });

  return ok({ to: recipient });
}

export async function logStubOutreachEmail(
  creatorId: string,
  kind: string,
): Promise<void> {
  await db.insert(creatorStubOutreachEmails).values({ creatorId, kind });
}

export async function setStubOutreachOptOut(
  creatorId: string,
  optedOut: boolean,
): Promise<Result<void, WelcomeError>> {
  try {
    await db
      .update(creators)
      .set({ stubOutreachOptOutAt: optedOut ? new Date() : null })
      .where(eq(creators.id, creatorId));
    return ok(undefined);
  } catch (error) {
    console.error("setStubOutreachOptOut", error);
    return err({ reason: "Failed to update outreach opt-out", cause: error });
  }
}
