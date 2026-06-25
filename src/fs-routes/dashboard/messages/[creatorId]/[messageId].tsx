import { Context } from "hono";
import { createRoute } from "hono-fsr";
import Alert from "../../../../components/app/Alert";
import { deleteMessageById } from "../../../../features/dashboard/messages/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { routeParam } from "../../../../lib/routeParam";

export const DELETE = createRoute(async (c: Context) => {
  const messageId = routeParam(c, "messageId");

  const [error] = await deleteMessageById(messageId);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(<Alert type="success" message="Message deleted!" />);
});
