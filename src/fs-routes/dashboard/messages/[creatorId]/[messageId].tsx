import { Context } from "hono";
import { createRoute } from "hono-fsr";
import Alert from "../../../../components/app/Alert";
import { deleteMessageById } from "../../../../features/dashboard/messages/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";

export const DELETE = createRoute(async (c: Context) => {
  const messageId = c.req.param("messageId");

  const [error] = await deleteMessageById(messageId);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(<Alert type="success" message="Message deleted!" />);
});
