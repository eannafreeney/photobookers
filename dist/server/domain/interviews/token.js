import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creatorInterviews } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
const getInterviewByToken = async (inviteToken) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.inviteToken, inviteToken),
      with: { creator: true }
    });
    return ok(interview);
  } catch (error) {
    return err({ reason: "Failed to get interview by token", cause: error });
  }
};
const completeInterviewByToken = async (inviteToken, answers, promoImageUrl) => {
  try {
    const [row] = await db.update(creatorInterviews).set({
      status: "completed",
      completedAt: /* @__PURE__ */ new Date(),
      answers,
      promoImageUrl
    }).where(
      and(
        eq(creatorInterviews.inviteToken, inviteToken),
        eq(creatorInterviews.status, "sent")
      )
    ).returning();
    if (!row) {
      return err({
        reason: "Interview not found or already completed",
        cause: void 0
      });
    }
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to complete interview", cause: error });
  }
};
export {
  completeInterviewByToken,
  getInterviewByToken
};
