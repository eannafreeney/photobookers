import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executePOTWEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { showErrorAlert } from "../../../../../lib/alertHelpers";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, weekStart } = c.req.valid("form");
    if (!weekStart) return showErrorAlert(c, "Invalid email payload");

    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
    });
    if (response || !creator) return response!;

    return executePOTWEmail({ c, creator, creatorId, weekStart });
  },
);
