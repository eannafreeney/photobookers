import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../lib/validator";
import { deleteMultipleUsersSchema } from "../../../../features/dashboard/admin/users/schema";
import { deleteUserByIdAdmin } from "../../../../features/dashboard/admin/users/services";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { showErrorAlert } from "../../../../lib/alertHelpers";

export const POST = createRoute(
  formValidator(deleteMultipleUsersSchema),
  async (c) => {
    const { ids } = c.req.valid("form");
    const results = await Promise.all(ids.map((id) => deleteUserByIdAdmin(id)));
    const deleted = results.filter(Boolean).length;
    if (deleted !== ids.length)
      return showErrorAlert(c, "Failed to delete users");

    return c.html(
      <>
        <Alert type="success" message={`${deleted} user(s) deleted.`} />
        {dispatchEvents(["users:updated"])}
      </>,
    );
  },
);
