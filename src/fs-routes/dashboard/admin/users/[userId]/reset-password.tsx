import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { userIdSchema } from "../../../../../schemas";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { resetUserPasswordAdmin } from "../../../../../features/dashboard/admin/users/services";
import NewUserCredentialsModal from "../../../../../features/dashboard/admin/users/modals/NewUserCredentialsModal";
import { isErr } from "../../../../../lib/result";

export const POST = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;

  const result = await resetUserPasswordAdmin(userId);
  if (isErr(result)) return showErrorAlert(c, result[0].reason);

  const { email, temporaryPassword } = result[1];

  return c.html(
    <NewUserCredentialsModal
      email={email}
      temporaryPassword={temporaryPassword}
      title="Password reset – send these credentials"
    />,
  );
});
