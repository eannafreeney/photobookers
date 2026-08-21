import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import { reorderBooksInList } from "../../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../../domain/lists/utils.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
import { routeParam } from "../../../../lib/routeParam.js";
function canAccessLists(user) {
  return userCanManageBookLists(user);
}
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }
  let orderedIds;
  try {
    const body = await c.req.json();
    orderedIds = body.orderedIds ?? [];
  } catch {
    return showErrorAlert(c, "Invalid request body");
  }
  const [error] = await reorderBooksInList(listId, user.id, orderedIds);
  if (error) return showErrorAlert(c, error.reason);
  return showSuccessAlert(c, "Book order saved");
});
export {
  POST
};
