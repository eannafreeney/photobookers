import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../../utils.js";
import AuthModal from "../../../../../components/app/AuthModal.js";
import { getBookPermissionData } from "../../../../../features/api/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import { toggleListMembership } from "../../../../../domain/lists/services.js";
import { ListMembershipRow } from "../../../../../features/api/components/SaveToListButton.js";
import { routeParam } from "../../../../../lib/routeParam.js";
const POST = createRoute(async (c) => {
  const bookId = routeParam(c, "bookId");
  const listId = routeParam(c, "listId");
  const user = await getUser(c);
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to save this book to a list." }), 401);
  }
  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");
  const [toggleErr, result] = await toggleListMembership(
    listId,
    bookId,
    user.id
  );
  if (toggleErr || !result) {
    return showErrorAlert(c, toggleErr?.reason ?? "Failed to update list");
  }
  const message = result.added ? `Added to ${result.list.title}` : `Removed from ${result.list.title}`;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      /* @__PURE__ */ jsx(
        ListMembershipRow,
        {
          bookId,
          list: {
            id: result.list.id,
            title: result.list.title,
            containsBook: result.added
          }
        }
      )
    ] })
  );
});
export {
  POST
};
