import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../../utils.js";
import { isFeatureEnabledForUser } from "../../../../../lib/features.js";
import {
  getBooksInList,
  removeBookFromList
} from "../../../../../domain/lists/services.js";
import ListBooksEditor from "../../../../../features/dashboard/lists/ListBooksEditor.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import { routeParam } from "../../../../../lib/routeParam.js";
function canAccessLists(user) {
  if (user.creator) return true;
  return isFeatureEnabledForUser("collectors", user);
}
const DELETE = createRoute(async (c) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  const bookId = routeParam(c, "bookId");
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }
  const [err] = await removeBookFromList(listId, bookId, user.id);
  if (err) return showErrorAlert(c, err.reason);
  const [booksErr, booksResult] = await getBooksInList(listId, 1, "newest", 100);
  if (booksErr || !booksResult) {
    return showErrorAlert(c, booksErr?.reason ?? "Failed to reload books");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book removed." }),
      /* @__PURE__ */ jsx(ListBooksEditor, { listId, books: booksResult.books })
    ] })
  );
});
export {
  DELETE
};
