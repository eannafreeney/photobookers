import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import { reorderBooksInList } from "../../../../domain/lists/services";
import { userCanManageBookLists } from "../../../../domain/lists/utils";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import { routeParam } from "../../../../lib/routeParam";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return userCanManageBookLists(user);
}

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  let orderedIds: string[];
  try {
    const body = await c.req.json<{ orderedIds?: string[] }>();
    orderedIds = body.orderedIds ?? [];
  } catch {
    return showErrorAlert(c, "Invalid request body");
  }

  const [error] = await reorderBooksInList(listId, user.id, orderedIds);
  if (error) return showErrorAlert(c, error.reason);

  return showSuccessAlert(c, "Book order saved");
});
