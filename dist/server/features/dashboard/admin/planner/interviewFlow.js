import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import { creatorInterviews } from "../../../../db/schema.js";
import {
  createCreatorInterviewInviteAdmin,
  markInterviewEmailSentAdmin
} from "../creators/services.js";
import { err, ok } from "../../../../lib/result.js";
async function getLatestInterviewForCreator(creatorId) {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.creatorId, creatorId),
      orderBy: [desc(creatorInterviews.invitedAt)]
    });
    return ok(interview ?? null);
  } catch (error) {
    return err({ reason: "Failed to get latest interview", cause: error });
  }
}
async function ensureInterviewInviteForSpotlight(params) {
  const [existingError, existing] = await getLatestInterviewForCreator(
    params.creatorId
  );
  if (existingError) return err({ reason: existingError.reason });
  if (existing && existing.status === "sent") {
    return ok({
      interview: existing,
      interviewLink: `${process.env.SITE_URL}/interviews/${existing.inviteToken}`,
      created: false
    });
  }
  if (existing && (existing.status === "completed" || existing.status === "published")) {
    return ok({ interview: existing, interviewLink: null, created: false });
  }
  const inviteToken = nanoid(32);
  const [createError, interview] = await createCreatorInterviewInviteAdmin({
    creatorId: params.creatorId,
    creatorSlug: params.creatorSlug,
    recipientEmail: params.recipientEmail,
    invitedByUserId: params.invitedByUserId,
    inviteToken
  });
  if (createError || !interview)
    return err({ reason: createError?.reason ?? "Failed to create invite" });
  await markInterviewEmailSentAdmin(params.creatorId);
  return ok({
    interview,
    interviewLink: `${process.env.SITE_URL}/interviews/${inviteToken}`,
    created: true
  });
}
export {
  ensureInterviewInviteForSpotlight,
  getLatestInterviewForCreator
};
