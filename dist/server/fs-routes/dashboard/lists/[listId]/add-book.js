import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import {
  addBookToList,
  getBookListForOwner,
  getBooksInList,
  searchBooksForList
} from "../../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../../domain/lists/utils.js";
import ListBooksEditor from "../../../../features/dashboard/lists/ListBooks.js";
import { ListBookSearchResults } from "../../../../features/dashboard/lists/ListBookSearch.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import { routeParam } from "../../../../lib/routeParam.js";
function canAccessLists(user) {
  return userCanManageBookLists(user);
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  const query = c.req.query("q") ?? "";
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }
  const [ownerErr] = await getBookListForOwner(listId, user.id);
  if (ownerErr) return showErrorAlert(c, ownerErr.reason);
  const [searchErr, results] = await searchBooksForList(listId, query);
  if (searchErr || !results) {
    return showErrorAlert(c, searchErr?.reason ?? "Failed to search books");
  }
  return c.html(
    /* @__PURE__ */ jsx(ListBookSearchResults, { listId, query, results })
  );
});
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }
  const body = await c.req.parseBody();
  const bookId = String(body.bookId ?? "");
  const query = String(body.q ?? "");
  if (!bookId) return showErrorAlert(c, "Choose a book to add.");
  const [addErr] = await addBookToList(listId, bookId, user.id);
  if (addErr) return showErrorAlert(c, addErr.reason);
  const [booksErr, booksResult] = await getBooksInList(
    listId,
    1,
    "newest",
    100
  );
  if (booksErr || !booksResult) {
    return showErrorAlert(c, booksErr?.reason ?? "Failed to reload books");
  }
  const [searchErr, results] = await searchBooksForList(listId, query);
  if (searchErr || !results) {
    return showErrorAlert(c, searchErr?.reason ?? "Failed to search books");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book added." }),
      /* @__PURE__ */ jsx(ListBooksEditor, { listId, books: booksResult.books }),
      /* @__PURE__ */ jsx(ListBookSearchResults, { listId, query, results })
    ] })
  );
});
export {
  GET,
  POST
};
