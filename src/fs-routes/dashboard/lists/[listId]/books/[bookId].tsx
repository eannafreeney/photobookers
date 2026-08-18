import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../../utils";
import {
  getBooksInList,
  removeBookFromList,
} from "../../../../../domain/lists/services";
import { userCanManageBookLists } from "../../../../../domain/lists/utils";
import ListBooksEditor from "../../../../../features/dashboard/lists/ListBooks";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { routeParam } from "../../../../../lib/routeParam";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return userCanManageBookLists(user);
}

export const DELETE = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  const bookId = routeParam(c, "bookId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  const [err] = await removeBookFromList(listId, bookId, user.id);
  if (err) return showErrorAlert(c, err.reason);

  const [booksErr, booksResult] = await getBooksInList(
    listId,
    1,
    "newest",
    100,
  );
  if (booksErr || !booksResult) {
    return showErrorAlert(c, booksErr?.reason ?? "Failed to reload books");
  }

  return c.html(
    <>
      <Alert type="success" message="Book removed." />
      <ListBooksEditor listId={listId} books={booksResult.books} />
    </>,
  );
});
