import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import Alert from "../../../../components/app/Alert.js";
import { deleteMessageById } from "../../../../features/dashboard/messages/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { routeParam } from "../../../../lib/routeParam.js";
const DELETE = createRoute(async (c) => {
  const messageId = routeParam(c, "messageId");
  const [error] = await deleteMessageById(messageId);
  if (error) return showErrorAlert(c, error.reason);
  return c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: "Message deleted!" }));
});
export {
  DELETE
};
