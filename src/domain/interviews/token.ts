import { and, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { creatorInterviews } from "../../db/schema";
import { err, ok } from "../../lib/result";

export const getInterviewByToken = async (inviteToken: string) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.inviteToken, inviteToken),
      with: { creator: true },
    });
    return ok(interview);
  } catch (error) {
    return err({ reason: "Failed to get interview by token", cause: error });
  }
};

export const completeInterviewByToken = async (
  inviteToken: string,
  answers: { q1: string; q2: string; q3: string; q4: string; q5: string },
  promoImageUrl: string,
) => {
  try {
    const [row] = await db
      .update(creatorInterviews)
      .set({
        status: "completed",
        completedAt: new Date(),
        answers,
        promoImageUrl,
      })
      .where(
        and(
          eq(creatorInterviews.inviteToken, inviteToken),
          eq(creatorInterviews.status, "sent"),
        ),
      )
      .returning();

    if (!row) {
      return err({
        reason: "Interview not found or already completed",
        cause: undefined,
      });
    }

    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to complete interview", cause: error });
  }
};
