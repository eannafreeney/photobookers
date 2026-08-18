import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../../../utils";
import {
  getBooksInList,
  getListItemForOwner,
  updateListItemNote,
} from "../../../../../../domain/lists/services";
import { userCanManageBookLists } from "../../../../../../domain/lists/utils";
import ListBookNoteModal from "../../../../../../features/dashboard/lists/ListBookNoteModal";
import ListBooksEditor from "../../../../../../features/dashboard/lists/ListBooks";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { routeParam } from "../../../../../../lib/routeParam";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return userCanManageBookLists(user);
}

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  const bookId = routeParam(c, "bookId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  const [err, result] = await getListItemForOwner(listId, bookId, user.id);
  if (err || !result) {
    return showErrorAlert(c, err?.reason ?? "Book not found in this list");
  }

  return c.html(
    <ListBookNoteModal
      list={result.list}
      book={result.book}
      note={result.item.note}
    />,
  );
});

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  const bookId = routeParam(c, "bookId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  const body = await c.req.parseBody();
  const [err] = await updateListItemNote(
    listId,
    bookId,
    user.id,
    String(body.note ?? ""),
  );
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
      <Alert type="success" message="Note saved." />
      <ListBooksEditor listId={listId} books={booksResult.books} />
    </>,
  );
});
