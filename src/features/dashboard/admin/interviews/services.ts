import { eq } from "drizzle-orm";
import { db } from "../../../../db/client";
import { creatorInterviews } from "../../../../db/schema";
import { err, ok } from "../../../../lib/result";
import { InterviewFormSchema } from "../../../interviews/schema";

export const updateInterviewAndPublishById = async (
  interviewId: string,
  form: InterviewFormSchema,
) => {
  try {
    const [row] = await db
      .update(creatorInterviews)
      .set({
        answers: {
          q1: form.q1,
          q2: form.q2,
          q3: form.q3,
          q4: form.q4,
          q5: form.q5,
        },
        status: "published",
      })
      .where(eq(creatorInterviews.id, interviewId))
      .returning();

    if (!row) {
      return err({ reason: "Interview not found" });
    }

    return ok(row);
  } catch (error) {
    return err({
      reason: "Failed to update interview and publish",
      cause: error,
    });
  }
};

export const setInterviewPublishStatus = async (
  interviewId: string,
  intent: "publish" | "unpublish",
) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.id, interviewId),
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

      const [row] = await db
        .update(creatorInterviews)
        .set({ status: "published" })
        .where(eq(creatorInterviews.id, interviewId))
        .returning();
      if (!row) return err({ reason: "Interview not found" });
      return ok(row);
    }

    if (interview.status !== "published") {
      return err({ reason: "Interview is not published" });
    }

    const [row] = await db
      .update(creatorInterviews)
      .set({ status: "completed" })
      .where(eq(creatorInterviews.id, interviewId))
      .returning();
    if (!row) return err({ reason: "Interview not found" });
    return ok(row);
  } catch (error) {
    return err({
      reason: "Failed to update interview publish status",
      cause: error,
    });
  }
};

export const deleteInterviewById = async (interviewId: string) => {
  try {
    const [row] = await db
      .delete(creatorInterviews)
      .where(eq(creatorInterviews.id, interviewId))
      .returning();
    if (!row) {
      return err({ reason: "Interview not found" });
    }
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to delete interview", cause: error });
  }
};
