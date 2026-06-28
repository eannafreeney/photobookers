import { eq } from "drizzle-orm";
import { assignUserAsCreatorOwnerAdmin } from "../../domain/claims/owner";
import { db } from "../../db/client";
import {
  creatorStubOutreachEmails,
  creators,
  type Creator,
} from "../../db/schema";
import { generateWelcomeEmail } from "../dashboard/admin/creators/emails";
import { markWelcomeEmailSentAdmin } from "../dashboard/admin/creators/services";
import {
  createAuthUser,
  createUserWithAuthId,
} from "../dashboard/admin/users/services";
import { sendEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";

type WelcomeError = { reason: string; cause?: unknown };

export type SendStubWelcomeEmailOptions = {
  to?: string;
};

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

  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  let loginLink = `${siteUrl}/claims/${creator.id}/start`;

  if (!creator.ownerUserId) {
    const temporaryPassword = crypto.randomUUID();
    const [createAuthError, authData] = await createAuthUser(temporaryPassword, {
      email: recipient,
      firstName: undefined,
      lastName: undefined,
    });
    if (createAuthError || !authData) {
      return err({
        reason: createAuthError?.reason ?? "Failed to create auth user",
      });
    }

    const authUserId = authData.data.user.id;
    const [createUserErr] = await createUserWithAuthId(
      authUserId,
      { email: recipient, firstName: undefined, lastName: undefined },
      { mustResetPassword: true },
    );
    if (createUserErr) {
      return err({ reason: createUserErr.reason });
    }

    const [assignErr] = await assignUserAsCreatorOwnerAdmin(
      authUserId,
      creator.id,
    );
    if (assignErr) {
      return err({ reason: assignErr.reason });
    }

    loginLink = `${siteUrl}/auth/login?email=${encodeURIComponent(recipient)}&password=${encodeURIComponent(temporaryPassword)}`;
  }

  const html = generateWelcomeEmail(
    { ...creator, displayName: creator.displayName } as Creator,
    loginLink,
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
