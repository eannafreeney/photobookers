import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../../../utils.js";
import {
  getBooksInList,
  getListItemForOwner,
  getUserCommentsForBook,
  updateListItemNote
} from "../../../../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../../../../domain/lists/utils.js";
import ListBookNoteModal from "../../../../../../features/dashboard/lists/ListBookNoteModal.js";
import ListBooksEditor from "../../../../../../features/dashboard/lists/ListBooks.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
import { routeParam } from "../../../../../../lib/routeParam.js";
function canAccessLists(user) {
  return userCanManageBookLists(user);
}
const GET = createRoute(async (c) => {
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
  const comments = await getUserCommentsForBook(user.id, bookId);
  return c.html(
    /* @__PURE__ */ jsx(
      ListBookNoteModal,
      {
        list: result.list,
        book: result.book,
        note: result.item.note,
        comments
      }
    )
  );
});
const POST = createRoute(async (c) => {
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
    String(body.note ?? "")
  );
  if (err) return showErrorAlert(c, err.reason);
  const [booksErr, booksResult] = await getBooksInList(
    listId,
    1,
    "newest",
    100
  );
  if (booksErr || !booksResult) {
    return showErrorAlert(c, booksErr?.reason ?? "Failed to reload books");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Note saved." }),
      /* @__PURE__ */ jsx(ListBooksEditor, { listId, books: booksResult.books })
    ] })
  );
});
export {
  GET,
  POST
};
