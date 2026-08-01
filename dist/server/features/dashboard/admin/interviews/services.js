import { eq } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import { creatorInterviews } from "../../../../db/schema.js";
import { err, ok } from "../../../../lib/result.js";
const updateInterviewAndPublishById = async (interviewId, form) => {
  try {
    const [row] = await db.update(creatorInterviews).set({
      answers: {
        q1: form.q1,
        q2: form.q2,
        q3: form.q3,
        q4: form.q4,
        q5: form.q5
      },
      status: "published"
    }).where(eq(creatorInterviews.id, interviewId)).returning();
    if (!row) {
      return err({ reason: "Interview not found" });
    }
    return ok(row);
  } catch (error) {
    return err({
      reason: "Failed to update interview and publish",
      cause: error
    });
  }
};
const setInterviewPublishStatus = async (interviewId, intent) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.id, interviewId)
    });
    if (!interview) return err({ reason: "Interview not found" });
    if (intent === "publish") {
      if (interview.status !== "completed" && interview.status !== "published") {
        return err({ reason: "Only completed interviews can be published" });
      }
      if (!interview.promoImageUrl) {
        return err({ reason: "Add a promo image before publishing" });
      }
      if (!interview.answers) {
        return err({ reason: "Interview has no answers" });
      }
      const [row2] = await db.update(creatorInterviews).set({ status: "published" }).where(eq(creatorInterviews.id, interviewId)).returning();
      if (!row2) return err({ reason: "Interview not found" });
      return ok(row2);
    }
    if (interview.status !== "published") {
      return err({ reason: "Interview is not published" });
    }
    const [row] = await db.update(creatorInterviews).set({ status: "completed" }).where(eq(creatorInterviews.id, interviewId)).returning();
    if (!row) return err({ reason: "Interview not found" });
    return ok(row);
  } catch (error) {
    return err({
      reason: "Failed to update interview publish status",
      cause: error
    });
  }
};
const deleteInterviewById = async (interviewId) => {
  try {
    const [row] = await db.delete(creatorInterviews).where(eq(creatorInterviews.id, interviewId)).returning();
    if (!row) {
      return err({ reason: "Interview not found" });
    }
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to delete interview", cause: error });
  }
};
export {
  deleteInterviewById,
  setInterviewPublishStatus,
  updateInterviewAndPublishById
};
