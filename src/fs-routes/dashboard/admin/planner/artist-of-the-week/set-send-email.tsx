import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executeAOTWEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, weekStart } = c.req.valid("form");
    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
    });
    if (response || !creator) return response!;

    return executeAOTWEmail({ c, creator, creatorId, weekStart });
  },
);
