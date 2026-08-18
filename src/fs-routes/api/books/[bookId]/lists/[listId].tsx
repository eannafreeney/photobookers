import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../../utils";
import AuthModal from "../../../../../components/app/AuthModal";
import { getBookPermissionData } from "../../../../../features/api/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { toggleListMembership } from "../../../../../domain/lists/services";
import { userCanManageBookLists } from "../../../../../domain/lists/utils";
import { ListMembershipRow } from "../../../../../features/api/components/ListMembershipRow";
import { routeParam } from "../../../../../lib/routeParam";

export const POST = createRoute(async (c: Context) => {
  const bookId = routeParam(c, "bookId");
  const listId = routeParam(c, "listId");
  const user = await getUser(c);

  if (!user?.id) {
    return c.html(<AuthModal action="to save this book to a list." />, 401);
  }

  if (!userCanManageBookLists(user)) {
    return showErrorAlert(c, "Only collectors can add books to lists.");
  }

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");

  const [toggleErr, result] = await toggleListMembership(
    listId,
    bookId,
    user.id,
  );

  if (toggleErr || !result) {
    return showErrorAlert(c, toggleErr?.reason ?? "Failed to update list");
  }

  const message = result.added
    ? `Added to ${result.list.title}`
    : `Removed from ${result.list.title}`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <ListMembershipRow
        bookId={bookId}
        list={{
          id: result.list.id,
          title: result.list.title,
          containsBook: result.added,
        }}
      />
    </>,
  );
});
