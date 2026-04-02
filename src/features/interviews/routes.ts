import { Hono } from "hono";
import { formValidator } from "../../lib/validator";
import { interviewFormSchema } from "./schema";
import { getInterviewPage, submitInterview } from "./controllers";

export const interviewRoutes = new Hono();
interviewRoutes.get("/:inviteToken", getInterviewPage);
interviewRoutes.post(
  "/:inviteToken",
  formValidator(interviewFormSchema),
  submitInterview,
);
