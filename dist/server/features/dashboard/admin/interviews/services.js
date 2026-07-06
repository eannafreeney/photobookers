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
  updateInterviewAndPublishById
};
