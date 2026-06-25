import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { userIdSchema } from "../../../../../schemas";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../lib/alertHelpers";
import { resetUserPasswordAdmin } from "../../../../../features/dashboard/admin/users/services";
import { isErr } from "../../../../../lib/result";

export const POST = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;

  const result = await resetUserPasswordAdmin(userId);
  if (isErr(result)) return showErrorAlert(c, result[0].reason);

  const { email } = result[1];

  return showSuccessAlert(
    c,
    `We've emailed login instructions to ${email}.`,
  );
});
