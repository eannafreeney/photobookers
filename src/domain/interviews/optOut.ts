import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { creators } from "../../db/schema";
import { err, ok, type Result } from "../../lib/result";
import { getInterviewByToken } from "./token";

type OptOutError = { reason: string; cause?: unknown };

export async function setInterviewReminderOptOutByToken(
  inviteToken: string,
): Promise<Result<{ displayName: string; alreadyOptedOut: boolean }, OptOutError>> {
  const [interviewError, interview] = await getInterviewByToken(inviteToken);
  if (interviewError || !interview) {
    return err({ reason: "Invalid interview link", cause: interviewError?.cause });
  }

  if (interview.creator.interviewReminderOptOutAt) {
    return ok({
      displayName: interview.creator.displayName,
      alreadyOptedOut: true,
    });
  }

  try {
    await db
      .update(creators)
      .set({ interviewReminderOptOutAt: new Date() })
      .where(eq(creators.id, interview.creatorId));
    return ok({
      displayName: interview.creator.displayName,
      alreadyOptedOut: false,
    });
  } catch (error) {
    return err({
      reason: "Failed to opt out of interview reminders",
      cause: error,
    });
  }
}
