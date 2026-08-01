import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creators } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
import { getInterviewByToken } from "./token.js";
async function setInterviewReminderOptOutByToken(inviteToken) {
  const [interviewError, interview] = await getInterviewByToken(inviteToken);
  if (interviewError || !interview) {
    return err({ reason: "Invalid interview link", cause: interviewError?.cause });
  }
  if (interview.creator.interviewReminderOptOutAt) {
    return ok({
      displayName: interview.creator.displayName,
      alreadyOptedOut: true
    });
  }
  try {
    await db.update(creators).set({ interviewReminderOptOutAt: /* @__PURE__ */ new Date() }).where(eq(creators.id, interview.creatorId));
    return ok({
      displayName: interview.creator.displayName,
      alreadyOptedOut: false
    });
  } catch (error) {
    return err({
      reason: "Failed to opt out of interview reminders",
      cause: error
    });
  }
}
export {
  setInterviewReminderOptOutByToken
};
