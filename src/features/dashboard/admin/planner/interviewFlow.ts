import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { db } from "../../../../db/client";
import { creatorInterviews } from "../../../../db/schema";
import {
  createCreatorInterviewInviteAdmin,
  markInterviewEmailSentAdmin,
} from "../creators/services";
import { err, ok } from "../../../../lib/result";

export async function getLatestInterviewForCreator(creatorId: string) {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.creatorId, creatorId),
      orderBy: [desc(creatorInterviews.invitedAt)],
    });
    if (!interview) return err({ reason: "Interview not found" });
    return ok(interview);
  } catch (error) {
    return err({ reason: "Failed to get latest interview", cause: error });
  }
}

/** Create invite only when needed; return link for email body. */
export async function ensureInterviewInviteForSpotlight(params: {
  creatorId: string;
  creatorSlug: string;
  invitedByUserId: string;
  recipientEmail: string;
}) {
  const [existingError, existing] = await getLatestInterviewForCreator(
    params.creatorId,
  );
  if (existingError) return err({ reason: existingError.reason });

  // Reuse open invite
  if (existing && existing.status === "sent") {
    return ok({
      interview: existing,
      interviewLink: `${process.env.SITE_URL}/interviews/${existing.inviteToken}`,
      created: false,
    });
  }

  // Already done — no new invite
  if (
    existing &&
    (existing.status === "completed" || existing.status === "published")
  ) {
    return ok({ interview: existing, interviewLink: null, created: false });
  }

  const inviteToken = nanoid(32);
  const [createError, interview] = await createCreatorInterviewInviteAdmin({
    creatorId: params.creatorId,
    creatorSlug: params.creatorSlug,
    recipientEmail: params.recipientEmail,
    invitedByUserId: params.invitedByUserId,
    inviteToken,
  });
  if (createError || !interview)
    return err({ reason: createError?.reason ?? "Failed to create invite" });

  await markInterviewEmailSentAdmin(params.creatorId);

  return ok({
    interview,
    interviewLink: `${process.env.SITE_URL}/interviews/${inviteToken}`,
    created: true,
  });
}
